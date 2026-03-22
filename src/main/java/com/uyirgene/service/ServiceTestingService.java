package com.uyirgene.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uyirgene.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceTestingService {
    private final ServiceTestingRepository repository;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public List<ServiceTestingDto> getAllPublished() {
        return repository.findByPublishedTrueOrderByDisplayOrderAsc().stream()
                .map(ServiceTestingDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ServiceTestingDto> getAll() {
        return repository.findAllByOrderByDisplayOrderAsc().stream()
                .map(ServiceTestingDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ServiceTestingDto getById(Long id) {
        ServiceTesting entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service Testing not found"));
        return ServiceTestingDto.fromEntity(entity);
    }

    public ServiceTestingDto getBySlug(String slug) {
        ServiceTesting entity = repository.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Service Testing not found"));
        return ServiceTestingDto.fromEntity(entity);
    }

    private String generateUniqueSlug(String title, Long excludeId) {
        String base = title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        if (base.isEmpty()) base = "testing";
        String candidate = base;
        int suffix = 2;
        while (excludeId != null ? repository.existsBySlugAndIdNot(candidate, excludeId) : repository.existsBySlug(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    public ServiceTesting getEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service Testing not found"));
    }

    @Transactional
    public ServiceTestingDto create(
            String title,
            String subtitle,
            String description,
            String whatIs,
            String whyMatters,
            String certificate,
            List<String> testingServices,
            List<ServiceTestingDto.Highlight> highlights,
            Boolean published,
            Integer displayOrder,
            MultipartFile thumbnailImage,
            MultipartFile heroImage
    ) throws IOException {
        ServiceTesting entity = ServiceTesting.builder()
                .title(title)
                .slug(generateUniqueSlug(title, null))
                .subtitle(subtitle)
                .description(description)
                .whatIs(whatIs)
                .whyMatters(whyMatters)
                .certificate(certificate)
                .testingServices(toJson(testingServices))
                .highlights(toJson(highlights))
                .published(published != null ? published : false)
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .build();

        if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
            entity.setThumbnailImage(thumbnailImage.getBytes());
            entity.setThumbnailImageContentType(thumbnailImage.getContentType());
        }

        if (heroImage != null && !heroImage.isEmpty()) {
            entity.setHeroImage(heroImage.getBytes());
            entity.setHeroImageContentType(heroImage.getContentType());
        }

        ServiceTesting saved = repository.save(entity);
        return ServiceTestingDto.fromEntity(saved);
    }

    @Transactional
    public ServiceTestingDto update(
            Long id,
            String title,
            String subtitle,
            String description,
            String whatIs,
            String whyMatters,
            String certificate,
            List<String> testingServices,
            List<ServiceTestingDto.Highlight> highlights,
            Boolean published,
            Integer displayOrder,
            MultipartFile thumbnailImage,
            MultipartFile heroImage,
            Boolean removeThumbnail,
            Boolean removeHeroImage
    ) throws IOException {
        ServiceTesting entity = getEntityById(id);

        entity.setTitle(title);
        entity.setSlug(generateUniqueSlug(title, id));
        entity.setSubtitle(subtitle);
        entity.setDescription(description);
        entity.setWhatIs(whatIs);
        entity.setWhyMatters(whyMatters);
        entity.setCertificate(certificate);
        entity.setTestingServices(toJson(testingServices));
        entity.setHighlights(toJson(highlights));
        entity.setPublished(published != null ? published : entity.getPublished());
        entity.setDisplayOrder(displayOrder != null ? displayOrder : entity.getDisplayOrder());

        if (Boolean.TRUE.equals(removeThumbnail)) {
            entity.setThumbnailImage(null);
            entity.setThumbnailImageContentType(null);
        } else if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
            entity.setThumbnailImage(thumbnailImage.getBytes());
            entity.setThumbnailImageContentType(thumbnailImage.getContentType());
        }

        if (Boolean.TRUE.equals(removeHeroImage)) {
            entity.setHeroImage(null);
            entity.setHeroImageContentType(null);
        } else if (heroImage != null && !heroImage.isEmpty()) {
            entity.setHeroImage(heroImage.getBytes());
            entity.setHeroImageContentType(heroImage.getContentType());
        }

        ServiceTesting saved = repository.save(entity);
        return ServiceTestingDto.fromEntity(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Service Testing not found");
        }
        repository.deleteById(id);
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
