package com.uyirgene.course;

import com.uyirgene.course.dto.EnrollmentResult;
import com.uyirgene.course.dto.VideoDto;
import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/flagship")
@RequiredArgsConstructor
public class FlagshipProgramController {

    private final FlagshipProgramService service;
    private final EnrollmentService enrollmentService;
    private final FlagshipProgramRepository programRepo;
    private final CertificateRepository certRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final CurrentUserService currentUserService;

    @Value("${app.certificate.folder:uploads/certificates}")
    private String certFolder;

    // ==================== Public Endpoints ====================

    @GetMapping
    public ResponseEntity<List<FlagshipProgramDto>> getActivePrograms() {
        return ResponseEntity.ok(service.getActivePrograms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlagshipProgramDto> getProgramById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.getProgramById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<FlagshipProgramDto> getProgramBySlug(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(service.getProgramBySlug(slug));
    }

    /** Public code lookup — used by marketing campaign CTA resolution */
    @GetMapping("/code/{code}")
    public ResponseEntity<?> getByCode(@PathVariable("code") String code) {
        return service.findByProgramCode(code)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getBackgroundImage(@PathVariable("id") Long id) {
        return service.getBackgroundImage(id);
    }

    // ==================== Enrollment Endpoints ====================

    @PostMapping("/{id}/enroll")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EnrollmentResponse> enroll(
            @PathVariable("id") Long id,
            @RequestBody(required = false) EnrollRequest body) {

        String countryCode = body != null ? body.getCountryCode() : null;
        EnrollmentResult result = enrollmentService.startFlagshipEnrollment(id, countryCode);

        EnrollmentResponse resp = new EnrollmentResponse(
                result.getEnrollment(),
                result.getOrder(),
                result.isAlreadyEnrolled(),
                result.getMessage());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{id}/enroll/confirm")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Enrollment> confirmPayment(
            @PathVariable("id") Long id,
            @RequestBody PaymentConfirmDto body) {

        Enrollment e = enrollmentService.confirmFlagshipEnrollmentPayment(
                id, body.getRazorpayPaymentId(), body.getRazorpayOrderId(), body.getRazorpaySignature());
        return ResponseEntity.ok(e);
    }

    @DeleteMapping("/{id}/enroll")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> unenroll(@PathVariable("id") Long id) {
        enrollmentService.unenrollFlagship(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/enrolled")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public ResponseEntity<List<FlagshipProgramDto>> getEnrolled() {
        User user = currentUserService.getCurrentUser();
        List<Enrollment> enrollments = enrollmentRepo.findByUser(user).stream()
                .filter(e -> e.getFlagshipProgram() != null && e.getStatus() != Enrollment.Status.PENDING)
                .collect(Collectors.toList());

        List<FlagshipProgramDto> dtos = enrollments.stream().map(enrollment -> {
            FlagshipProgramDto dto = FlagshipProgramDto.fromEntity(enrollment.getFlagshipProgram());
            dto.setEnrollmentStatus(enrollment.getStatus().name());
            boolean resultPublished = enrollment.getResultPublishedAt() != null;
            dto.setResultPublished(resultPublished);
            Optional<Certificate> certOpt = certRepo.findByUserAndFlagshipProgram(user, enrollment.getFlagshipProgram());
            boolean hasCert = certOpt.isPresent() && resultPublished;
            dto.setHasCertificate(hasCert);
            dto.setCanDownloadCertificate(hasCert);
            if (hasCert) {
                dto.setCertificateId(certOpt.get().getCertificateId());
            }
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}/certificate/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> downloadCertificate(@PathVariable("id") Long id) {
        User user = currentUserService.getCurrentUser();

        FlagshipProgram program = programRepo.findById(id).orElse(null);
        if (program == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Program not found"));
        }

        Optional<Enrollment> enrollmentOpt = enrollmentRepo.findByUserAndFlagshipProgram(user, program);
        if (enrollmentOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "You are not enrolled in this program"));
        }

        Enrollment enrollment = enrollmentOpt.get();
        if (enrollment.getResultPublishedAt() == null) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Results not yet published. Certificate download will be available after results are published."));
        }

        Optional<Certificate> certOpt = certRepo.findByUserAndFlagshipProgram(user, program);
        if (certOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Certificate not found. Please wait for admin to generate your certificate."));
        }

        Certificate cert = certOpt.get();
        File file = new File(cert.getFilePath());

        try {
            Path certDir = Path.of(certFolder).toAbsolutePath().normalize();
            Path filePath = file.toPath().toAbsolutePath().normalize();
            if (!filePath.startsWith(certDir)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Certificate path validation failed"));
        }

        if (!file.exists()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Certificate file not found. Please contact admin to regenerate the certificate."));
        }

        FileSystemResource fs = new FileSystemResource(file);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=certificate-" + cert.getCertificateId() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(fs);
    }

    @GetMapping("/{id}/videos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<VideoDto>> getVideos(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.listVideosEncrypted(id));
    }

    // ==================== Admin Endpoints ====================

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FlagshipProgramDto>> getAllPrograms() {
        return ResponseEntity.ok(service.getAllPrograms());
    }

    @PostMapping(value = "/admin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FlagshipProgramDto> createProgram(
            @RequestParam("title") String title,
            @RequestParam(value = "tagline", required = false) String tagline,
            @RequestParam(value = "cardDescription", required = false) String cardDescription,
            @RequestParam(value = "cardHighlights", required = false) String cardHighlights,
            @RequestParam(value = "sections", required = false) String sections,
            @RequestParam(value = "active", defaultValue = "true") Boolean active,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "trainerName", required = false) String trainerName,
            @RequestParam(value = "testLink", required = false) String testLink,
            @RequestParam(value = "testDescription", required = false) String testDescription,
            @RequestParam(value = "targetAudience", required = false) String targetAudience,
            @RequestParam(value = "assessment", required = false) String assessment,
            @RequestParam(value = "outcome", required = false) String outcome,
            @RequestParam(value = "examDetails", required = false) String examDetails,
            @RequestParam(value = "countryPrices", required = false) String countryPricesJson,
            @RequestParam(value = "videos", required = false) String videosJson,
            @RequestParam(value = "programCode", required = false) String programCode,
            @RequestParam(value = "reminderDays", required = false) Integer reminderDays,
            @RequestParam(value = "assessmentLinks", required = false) String assessmentLinksJson,
            @RequestParam(value = "preAssessmentLinks", required = false) String preAssessmentLinksJson,
            @RequestParam(value = "preAssessmentInstructions", required = false) String preAssessmentInstructions,
            @RequestParam(value = "trainingDuration", required = false) String trainingDuration
    ) throws IOException {
        byte[] imageBytes = null;
        String imageContentType = null;
        if (backgroundImage != null && !backgroundImage.isEmpty()) {
            String err = validateImage(backgroundImage);
            if (err != null) return ResponseEntity.badRequest().build();
            imageBytes = backgroundImage.getBytes();
            imageContentType = backgroundImage.getContentType();
        }

        FlagshipProgramDto result = service.createProgram(
                title, tagline, cardDescription, cardHighlights, sections,
                active, displayOrder, imageBytes, imageContentType,
                price, trainerName, testLink, testDescription,
                targetAudience, assessment, outcome, examDetails,
                countryPricesJson, videosJson, programCode, reminderDays, assessmentLinksJson,
                preAssessmentLinksJson, preAssessmentInstructions, trainingDuration);

        return ResponseEntity.created(URI.create("/api/flagship/" + result.getId())).body(result);
    }

    @PutMapping(value = "/admin/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FlagshipProgramDto> updateProgram(
            @PathVariable("id") Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "tagline", required = false) String tagline,
            @RequestParam(value = "cardDescription", required = false) String cardDescription,
            @RequestParam(value = "cardHighlights", required = false) String cardHighlights,
            @RequestParam(value = "sections", required = false) String sections,
            @RequestParam(value = "active", defaultValue = "true") Boolean active,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage,
            @RequestParam(value = "removeBackgroundImage", defaultValue = "false") Boolean removeBackgroundImage,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "trainerName", required = false) String trainerName,
            @RequestParam(value = "testLink", required = false) String testLink,
            @RequestParam(value = "testDescription", required = false) String testDescription,
            @RequestParam(value = "targetAudience", required = false) String targetAudience,
            @RequestParam(value = "assessment", required = false) String assessment,
            @RequestParam(value = "outcome", required = false) String outcome,
            @RequestParam(value = "examDetails", required = false) String examDetails,
            @RequestParam(value = "countryPrices", required = false) String countryPricesJson,
            @RequestParam(value = "videos", required = false) String videosJson,
            @RequestParam(value = "programCode", required = false) String programCode,
            @RequestParam(value = "reminderDays", required = false) Integer reminderDays,
            @RequestParam(value = "assessmentLinks", required = false) String assessmentLinksJson,
            @RequestParam(value = "preAssessmentLinks", required = false) String preAssessmentLinksJson,
            @RequestParam(value = "preAssessmentInstructions", required = false) String preAssessmentInstructions,
            @RequestParam(value = "trainingDuration", required = false) String trainingDuration
    ) throws IOException {
        byte[] imageBytes = null;
        String imageContentType = null;
        if (backgroundImage != null && !backgroundImage.isEmpty()) {
            String err = validateImage(backgroundImage);
            if (err != null) return ResponseEntity.badRequest().build();
            imageBytes = backgroundImage.getBytes();
            imageContentType = backgroundImage.getContentType();
        }

        FlagshipProgramDto result = service.updateProgram(
                id, title, tagline, cardDescription, cardHighlights, sections,
                active, displayOrder, imageBytes, imageContentType, removeBackgroundImage,
                price, trainerName, testLink, testDescription,
                targetAudience, assessment, outcome, examDetails,
                countryPricesJson, videosJson, programCode, reminderDays, assessmentLinksJson,
                preAssessmentLinksJson, preAssessmentInstructions, trainingDuration);

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProgram(@PathVariable("id") Long id) {
        service.deleteProgram(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FlagshipProgramDto> toggleActive(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.toggleActive(id));
    }

    // ==================== Inner DTOs ====================

    @Data
    public static class EnrollRequest {
        private String countryCode;
    }

    @Data
    public static class PaymentConfirmDto {
        private String razorpayPaymentId;
        private String razorpayOrderId;
        private String razorpaySignature;
    }

    @Data
    public static class EnrollmentResponse {
        private Enrollment enrollment;
        private EnrollmentResult.RazorpayOrder order;
        private boolean alreadyEnrolled;
        private String message;

        public EnrollmentResponse(Enrollment enrollment, EnrollmentResult.RazorpayOrder order,
                                  boolean alreadyEnrolled, String message) {
            this.enrollment = enrollment;
            this.order = order;
            this.alreadyEnrolled = alreadyEnrolled;
            this.message = message;
        }
    }

    // ==================== Helpers ====================

    private static final Set<String> ALLOWED_IMAGE_TYPES =
            Set.of("image/jpeg", "image/png", "image/gif", "image/webp");

    private String validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) return null;
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            return "Invalid image type. Allowed: JPEG, PNG, GIF, WebP";
        }
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[4];
            if (is.read(header) < 4) return "File too small";
            boolean valid =
                    (header[0] == (byte) 0xFF && header[1] == (byte) 0xD8) ||
                    (header[0] == (byte) 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) ||
                    (header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46) ||
                    (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46);
            if (!valid) return "File content does not match a valid image format";
        } catch (IOException e) {
            return "Could not read image file";
        }
        return null;
    }
}
