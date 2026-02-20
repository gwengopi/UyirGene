package com.uyirgene.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;

import java.util.Collections;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCertificationDto {
    private Long id;
    private String title;
    private String subtitle;
    private String description;
    private String whatIs;
    private List<String> keyElements;
    private List<String> whoNeeds;
    private List<CertificationStep> certificationRoute;
    private List<String> benefits;
    private String thumbnailImageUrl;
    private String heroImageUrl;
    private Boolean published;
    private Integer displayOrder;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificationStep {
        private String label;
        private String description;
    }

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static ServiceCertificationDto fromEntity(ServiceCertification entity) {
        if (entity == null) return null;

        return ServiceCertificationDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .subtitle(entity.getSubtitle())
                .description(entity.getDescription())
                .whatIs(entity.getWhatIs())
                .keyElements(parseStringList(entity.getKeyElements()))
                .whoNeeds(parseStringList(entity.getWhoNeeds()))
                .certificationRoute(parseStepList(entity.getCertificationRoute()))
                .benefits(parseStringList(entity.getBenefits()))
                .thumbnailImageUrl(entity.getThumbnailImage() != null ? "/api/service-certifications/" + entity.getId() + "/thumbnail" : null)
                .heroImageUrl(entity.getHeroImage() != null ? "/api/service-certifications/" + entity.getId() + "/hero-image" : null)
                .published(entity.getPublished())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }

    private static List<String> parseStringList(String json) {
        if (json == null || json.isEmpty()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private static List<CertificationStep> parseStepList(String json) {
        if (json == null || json.isEmpty()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<CertificationStep>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
}
