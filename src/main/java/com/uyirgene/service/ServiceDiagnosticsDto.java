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
public class ServiceDiagnosticsDto {
    private Long id;
    private String title;
    private String subtitle;
    private String description;
    private List<TestProfile> testProfiles;
    private List<Highlight> highlights;
    private String thumbnailImageUrl;
    private String heroImageUrl;
    private Boolean published;
    private Integer displayOrder;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestProfile {
        private String title;
        private String description;
        private String reportingTime;
        private String category;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Highlight {
        private String title;
        private String description;
    }

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static ServiceDiagnosticsDto fromEntity(ServiceDiagnostics entity) {
        if (entity == null) return null;

        return ServiceDiagnosticsDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .subtitle(entity.getSubtitle())
                .description(entity.getDescription())
                .testProfiles(parseTestProfileList(entity.getTestProfiles()))
                .highlights(parseHighlightList(entity.getHighlights()))
                .thumbnailImageUrl(entity.getThumbnailImage() != null ?
                        "/api/service-diagnostics/" + entity.getId() + "/thumbnail" : null)
                .heroImageUrl(entity.getHeroImage() != null ?
                        "/api/service-diagnostics/" + entity.getId() + "/hero-image" : null)
                .published(entity.getPublished())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }

    private static List<TestProfile> parseTestProfileList(String json) {
        if (json == null || json.isEmpty()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<TestProfile>>() {});
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
