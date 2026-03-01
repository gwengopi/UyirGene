package com.uyirgene.course;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uyirgene.course.dto.VideoDto;
import com.uyirgene.exception.EntityNotFoundException;
import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlagshipProgramService {

    @PersistenceContext
    private EntityManager entityManager;

    private final FlagshipProgramRepository repository;
    private final FlagshipProgramPriceRepository priceRepository;
    private final FlagshipVideoRepository videoRepository;
    private final EnrollmentRepository enrollmentRepo;
    private final CurrentUserService currentUserService;
    private final VideoUrlEncryptionService encryptionService;
    private final ObjectMapper objectMapper;

    // ==================== Public ====================

    @Transactional(readOnly = true)
    public List<FlagshipProgramDto> getActivePrograms() {
        return repository.findByActiveTrueOrderByDisplayOrderAscIdAsc().stream()
                .map(FlagshipProgramDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FlagshipProgramDto getProgramById(Long id) {
        FlagshipProgram program = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flagship program not found"));
        return FlagshipProgramDto.fromEntity(program);
    }

    @Transactional(readOnly = true)
    public FlagshipProgramDto getProgramBySlug(String slug) {
        FlagshipProgram program = repository.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Flagship program not found"));
        return FlagshipProgramDto.fromEntity(program);
    }

    public ResponseEntity<byte[]> getBackgroundImage(Long id) {
        return repository.findById(id).map(program -> {
            if (program.getBackgroundImage() == null || program.getBackgroundImage().length == 0) {
                return ResponseEntity.notFound().<byte[]>build();
            }
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    program.getBackgroundImageContentType() != null
                            ? program.getBackgroundImageContentType()
                            : "image/jpeg"));
            headers.setContentLength(program.getBackgroundImage().length);
            return new ResponseEntity<>(program.getBackgroundImage(), headers, HttpStatus.OK);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * List videos for an enrolled user (URLs are encrypted for playback).
     */
    @Transactional(readOnly = true)
    public List<VideoDto> listVideosEncrypted(Long programId) {
        FlagshipProgram program = repository.findById(programId)
                .orElseThrow(() -> new EntityNotFoundException("Flagship program not found"));

        User user = currentUserService.getCurrentUser();
        Optional<Enrollment> enrollment = enrollmentRepo.findByUserAndFlagshipProgram(user, program);
        if (enrollment.isEmpty() ||
                (enrollment.get().getStatus() != Enrollment.Status.ENROLLED &&
                 enrollment.get().getStatus() != Enrollment.Status.COMPLETED)) {
            throw new SecurityException("User not enrolled in this flagship program");
        }

        return videoRepository.findByProgramIdOrderByOrderIndexAsc(programId).stream()
                .map(v -> VideoDto.builder()
                        .id(v.getId())
                        .title(v.getTitle())
                        .encryptedUrl(encryptionService.encryptUrl(v.getUrl()))
                        .orderIndex(v.getOrderIndex())
                        .durationSeconds(v.getDurationSeconds())
                        .build())
                .collect(Collectors.toList());
    }

    // ==================== Admin CRUD ====================

    @Transactional(readOnly = true)
    public List<FlagshipProgramDto> getAllPrograms() {
        return repository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .map(FlagshipProgramDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public FlagshipProgramDto createProgram(String title, String tagline, String cardDescription,
                                            String cardHighlights, String sections,
                                            Boolean active, Integer displayOrder,
                                            byte[] backgroundImage, String backgroundImageContentType,
                                            Double price, String trainerName,
                                            String testLink, String testDescription,
                                            String targetAudience, String assessment, String outcome,
                                            String examDetails, String countryPricesJson,
                                            String videosJson, String programCode, Integer reminderDays,
                                            String assessmentLinksJson, String preAssessmentLinksJson,
                                            String preAssessmentInstructions) {
        String slug = generateSlug(title);
        String code = (programCode != null && !programCode.isBlank())
                ? programCode.trim().toUpperCase()
                : generateProgramCode(title, null);

        FlagshipProgram program = FlagshipProgram.builder()
                .title(title)
                .tagline(tagline)
                .slug(slug)
                .programCode(code)
                .cardDescription(cardDescription)
                .cardHighlights(cardHighlights)
                .sections(sections)
                .active(active != null ? active : true)
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .backgroundImage(backgroundImage)
                .backgroundImageContentType(backgroundImageContentType)
                .price(price)
                .trainerName(trainerName)
                .testLink(testLink)
                .testDescription(testDescription)
                .assessmentLinks(assessmentLinksJson)
                .preAssessmentLinks(preAssessmentLinksJson)
                .preAssessmentInstructions(preAssessmentInstructions)
                .targetAudience(targetAudience)
                .assessment(assessment)
                .outcome(outcome)
                .examDetails(examDetails)
                .reminderDays(reminderDays)
                .build();

        FlagshipProgram saved = repository.save(program);
        saveCountryPrices(saved, countryPricesJson);
        saveVideos(saved, videosJson);
        // Flush pending inserts/deletes then evict the entity so that the lazy
        // collections (videos, countryPrices) are re-read fresh from the DB.
        entityManager.flush();
        entityManager.refresh(saved);
        return FlagshipProgramDto.fromEntity(saved);
    }

    @Transactional
    public FlagshipProgramDto updateProgram(Long id, String title, String tagline, String cardDescription,
                                            String cardHighlights, String sections,
                                            Boolean active, Integer displayOrder,
                                            byte[] backgroundImage, String backgroundImageContentType,
                                            boolean removeBackgroundImage,
                                            Double price, String trainerName,
                                            String testLink, String testDescription,
                                            String targetAudience, String assessment, String outcome,
                                            String examDetails, String countryPricesJson,
                                            String videosJson, String programCode, Integer reminderDays,
                                            String assessmentLinksJson, String preAssessmentLinksJson,
                                            String preAssessmentInstructions) {
        FlagshipProgram program = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flagship program not found"));

        String newSlug = generateSlug(title, id);
        if (!newSlug.equals(program.getSlug())) {
            program.setSlug(newSlug);
        }

        program.setTitle(title);
        program.setTagline(tagline);
        program.setCardDescription(cardDescription);
        program.setCardHighlights(cardHighlights);
        program.setSections(sections);
        program.setActive(active != null ? active : true);
        program.setDisplayOrder(displayOrder != null ? displayOrder : 0);
        program.setPrice(price);
        program.setTrainerName(trainerName);
        program.setTestLink(testLink);
        program.setTestDescription(testDescription);
        program.setAssessmentLinks(assessmentLinksJson);
        program.setPreAssessmentLinks(preAssessmentLinksJson);
        program.setPreAssessmentInstructions(preAssessmentInstructions);
        program.setTargetAudience(targetAudience);
        program.setAssessment(assessment);
        program.setOutcome(outcome);
        program.setExamDetails(examDetails);
        program.setReminderDays(reminderDays);

        // Update program code if provided and different
        if (programCode != null && !programCode.isBlank()) {
            String newCode = programCode.trim().toUpperCase();
            if (!newCode.equals(program.getProgramCode())) {
                program.setProgramCode(newCode);
            }
        } else if (program.getProgramCode() == null) {
            program.setProgramCode(generateProgramCode(title, id));
        }

        if (removeBackgroundImage) {
            program.setBackgroundImage(null);
            program.setBackgroundImageContentType(null);
        } else if (backgroundImage != null) {
            program.setBackgroundImage(backgroundImage);
            program.setBackgroundImageContentType(backgroundImageContentType);
        }

        FlagshipProgram saved = repository.save(program);
        saveCountryPrices(saved, countryPricesJson);
        saveVideos(saved, videosJson);
        entityManager.flush();
        entityManager.refresh(saved);
        return FlagshipProgramDto.fromEntity(saved);
    }

    @Transactional
    public void deleteProgram(Long id) {
        FlagshipProgram program = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flagship program not found"));
        repository.delete(program);
    }

    @Transactional
    public FlagshipProgramDto toggleActive(Long id) {
        FlagshipProgram program = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flagship program not found"));
        program.setActive(!program.getActive());
        return FlagshipProgramDto.fromEntity(repository.save(program));
    }

    // ==================== Helpers ====================

    private void saveCountryPrices(FlagshipProgram program, String countryPricesJson) {
        priceRepository.deleteByFlagshipProgramId(program.getId());
        // Flush DELETEs to DB immediately so the INSERT of new prices below does not
        // collide with the unique constraint on (flagship_program_id, country_code).
        // Hibernate's default action queue processes INSERTs before DELETEs, which
        // would cause a ConstraintViolationException when re-saving the same country.
        entityManager.flush();
        if (countryPricesJson == null || countryPricesJson.isBlank()) return;
        try {
            List<Map<String, Object>> rows = objectMapper.readValue(countryPricesJson,
                    new TypeReference<>() {});
            for (Map<String, Object> row : rows) {
                String cc = (String) row.get("countryCode");
                String cur = (String) row.get("currencyCode");
                Object amt = row.get("amount");
                if (cc == null || cc.isBlank() || cur == null || cur.isBlank() || amt == null) continue;
                double amount = amt instanceof Number ? ((Number) amt).doubleValue()
                        : Double.parseDouble(amt.toString());
                FlagshipProgramPrice fpp = FlagshipProgramPrice.builder()
                        .flagshipProgram(program)
                        .countryCode(cc.trim().toUpperCase())
                        .currencyCode(cur.trim().toUpperCase())
                        .amount(amount)
                        .build();
                priceRepository.save(fpp);
            }
        } catch (Exception e) {
            log.warn("Could not parse countryPrices JSON for flagship {}: {}", program.getId(), e.getMessage());
        }
    }

    private void saveVideos(FlagshipProgram program, String videosJson) {
        videoRepository.deleteByProgramId(program.getId());
        entityManager.flush();
        if (videosJson == null || videosJson.isBlank()) return;
        try {
            List<Map<String, Object>> rows = objectMapper.readValue(videosJson, new TypeReference<>() {});
            int index = 0;
            for (Map<String, Object> row : rows) {
                String url = row.get("url") != null ? row.get("url").toString().trim() : null;
                if (url == null || url.isBlank()) continue;
                String title = row.get("title") != null ? row.get("title").toString().trim() : "Video " + (index + 1);
                Object orderIdx = row.get("orderIndex");
                Object duration = row.get("durationSeconds");

                FlagshipVideo video = FlagshipVideo.builder()
                        .program(program)
                        .title(title)
                        .url(url)
                        .orderIndex(orderIdx != null ? ((Number) orderIdx).intValue() : index)
                        .durationSeconds(duration != null ? ((Number) duration).intValue() : null)
                        .build();
                videoRepository.save(video);
                index++;
            }
        } catch (Exception e) {
            log.warn("Could not parse videos JSON for flagship {}: {}", program.getId(), e.getMessage());
        }
    }

    /**
     * Look up a flagship program by its programCode. Used by marketing campaign CTA resolution.
     */
    @Transactional(readOnly = true)
    public java.util.Optional<FlagshipProgramDto> findByProgramCode(String code) {
        return repository.findByProgramCodeIgnoreCase(code).map(FlagshipProgramDto::fromEntity);
    }

    private String generateProgramCode(String title, Long excludeId) {
        String base = "FP-" + title.toUpperCase()
                .replaceAll("[^A-Z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "-");
        if (base.length() > 30) base = base.substring(0, 30).replaceAll("-$", "");

        if (!programCodeExists(base, excludeId)) return base;

        int suffix = 2;
        while (programCodeExists(base + "-" + suffix, excludeId)) {
            suffix++;
        }
        return base + "-" + suffix;
    }

    private boolean programCodeExists(String code, Long excludeId) {
        if (excludeId == null) return repository.existsByProgramCode(code);
        return repository.existsByProgramCodeAndIdNot(code, excludeId);
    }

    private String generateSlug(String title) {
        return generateSlug(title, null);
    }

    private String generateSlug(String title, Long excludeId) {
        String base = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        if (!slugExists(base, excludeId)) return base;

        int suffix = 2;
        while (slugExists(base + "-" + suffix, excludeId)) {
            suffix++;
        }
        return base + "-" + suffix;
    }

    private boolean slugExists(String slug, Long excludeId) {
        if (excludeId == null) return repository.existsBySlug(slug);
        return repository.existsBySlugAndIdNot(slug, excludeId);
    }
}
