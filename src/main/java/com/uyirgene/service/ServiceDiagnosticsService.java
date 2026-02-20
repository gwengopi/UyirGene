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
public class ServiceDiagnosticsService {
    private final ServiceDiagnosticsRepository repository;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public List<ServiceDiagnosticsDto> getAllPublished() {
        return repository.findByPublishedTrueOrderByDisplayOrderAsc().stream()
                .map(ServiceDiagnosticsDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ServiceDiagnosticsDto> getAll() {
        return repository.findAllByOrderByDisplayOrderAsc().stream()
                .map(ServiceDiagnosticsDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ServiceDiagnosticsDto getById(Long id) {
        ServiceDiagnostics entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service Diagnostics not found"));
        return ServiceDiagnosticsDto.fromEntity(entity);
    }

    public ServiceDiagnostics getEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service Diagnostics not found"));
    }

    @Transactional
    public ServiceDiagnosticsDto create(
            String title,
            String subtitle,
            String description,
            List<ServiceDiagnosticsDto.TestProfile> testProfiles,
            List<ServiceDiagnosticsDto.Highlight> highlights,
            Boolean published,
            Integer displayOrder,
            MultipartFile thumbnailImage,
            MultipartFile heroImage
    ) throws IOException {
        ServiceDiagnostics entity = ServiceDiagnostics.builder()
                .title(title)
                .subtitle(subtitle)
                .description(description)
                .testProfiles(toJson(testProfiles))
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

        ServiceDiagnostics saved = repository.save(entity);
        return ServiceDiagnosticsDto.fromEntity(saved);
    }

    @Transactional
    public ServiceDiagnosticsDto update(
            Long id,
            String title,
            String subtitle,
            String description,
            List<ServiceDiagnosticsDto.TestProfile> testProfiles,
            List<ServiceDiagnosticsDto.Highlight> highlights,
            Boolean published,
            Integer displayOrder,
            MultipartFile thumbnailImage,
            MultipartFile heroImage,
            Boolean removeThumbnail,
            Boolean removeHeroImage
    ) throws IOException {
        ServiceDiagnostics entity = getEntityById(id);

        entity.setTitle(title);
        entity.setSubtitle(subtitle);
        entity.setDescription(description);
        entity.setTestProfiles(toJson(testProfiles));
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

        ServiceDiagnostics saved = repository.save(entity);
        return ServiceDiagnosticsDto.fromEntity(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Service Diagnostics not found");
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
