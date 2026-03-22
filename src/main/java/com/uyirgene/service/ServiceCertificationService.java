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
public class ServiceCertificationService {
    private final ServiceCertificationRepository repository;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public List<ServiceCertificationDto> getAllPublished() {
        return repository.findByPublishedTrueOrderByDisplayOrderAsc().stream()
                .map(ServiceCertificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ServiceCertificationDto> getAll() {
        return repository.findAllByOrderByDisplayOrderAsc().stream()
                .map(ServiceCertificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ServiceCertificationDto getById(Long id) {
        ServiceCertification entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service Certification not found"));
        return ServiceCertificationDto.fromEntity(entity);
    }

    public ServiceCertificationDto getBySlug(String slug) {
        ServiceCertification entity = repository.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Service Certification not found"));
        return ServiceCertificationDto.fromEntity(entity);
    }

    private String generateUniqueSlug(String title, Long excludeId) {
        String base = title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        if (base.isEmpty()) base = "certification";
        String candidate = base;
        int suffix = 2;
        while (excludeId != null ? repository.existsBySlugAndIdNot(candidate, excludeId) : repository.existsBySlug(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    public ServiceCertification getEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service Certification not found"));
    }

    @Transactional
    public ServiceCertificationDto create(
            String title,
            String subtitle,
            String description,
            String whatIs,
            List<String> keyElements,
            List<String> whoNeeds,
            List<ServiceCertificationDto.CertificationStep> certificationRoute,
            List<String> benefits,
            Boolean published,
            Integer displayOrder,
            MultipartFile thumbnailImage,
            MultipartFile heroImage
    ) throws IOException {
        ServiceCertification entity = ServiceCertification.builder()
                .title(title)
                .slug(generateUniqueSlug(title, null))
                .subtitle(subtitle)
                .description(description)
                .whatIs(whatIs)
                .keyElements(toJson(keyElements))
                .whoNeeds(toJson(whoNeeds))
                .certificationRoute(toJson(certificationRoute))
                .benefits(toJson(benefits))
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

        ServiceCertification saved = repository.save(entity);
        return ServiceCertificationDto.fromEntity(saved);
    }

    @Transactional
    public ServiceCertificationDto update(
            Long id,
            String title,
            String subtitle,
            String description,
            String whatIs,
            List<String> keyElements,
            List<String> whoNeeds,
            List<ServiceCertificationDto.CertificationStep> certificationRoute,
            List<String> benefits,
            Boolean published,
            Integer displayOrder,
            MultipartFile thumbnailImage,
            MultipartFile heroImage,
            Boolean removeThumbnail,
            Boolean removeHeroImage
    ) throws IOException {
        ServiceCertification entity = getEntityById(id);

        entity.setTitle(title);
        entity.setSlug(generateUniqueSlug(title, id));
        entity.setSubtitle(subtitle);
        entity.setDescription(description);
        entity.setWhatIs(whatIs);
        entity.setKeyElements(toJson(keyElements));
        entity.setWhoNeeds(toJson(whoNeeds));
        entity.setCertificationRoute(toJson(certificationRoute));
        entity.setBenefits(toJson(benefits));
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

        ServiceCertification saved = repository.save(entity);
        return ServiceCertificationDto.fromEntity(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Service Certification not found");
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
