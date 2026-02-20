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
public class ServiceTestingDto {
    private Long id;
    private String title;
    private String subtitle;
    private String description;
    private String whatIs;
    private String whyMatters;
    private String certificate;
    private List<String> testingServices;
    private List<Highlight> highlights;
    private String thumbnailImageUrl;
    private String heroImageUrl;
    private Boolean published;
    private Integer displayOrder;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Highlight {
        private String title;
        private String description;
    }

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static ServiceTestingDto fromEntity(ServiceTesting entity) {
        if (entity == null) return null;

        return ServiceTestingDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .subtitle(entity.getSubtitle())
                .description(entity.getDescription())
                .whatIs(entity.getWhatIs())
                .whyMatters(entity.getWhyMatters())
                .certificate(entity.getCertificate())
                .testingServices(parseStringList(entity.getTestingServices()))
                .highlights(parseHighlightList(entity.getHighlights()))
                .thumbnailImageUrl(entity.getThumbnailImage() != null ?
                        "/api/service-testings/" + entity.getId() + "/thumbnail" : null)
                .heroImageUrl(entity.getHeroImage() != null ?
                        "/api/service-testings/" + entity.getId() + "/hero-image" : null)
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

    private static List<Highlight> parseHighlightList(String json) {
        if (json == null || json.isEmpty()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<Highlight>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
}
