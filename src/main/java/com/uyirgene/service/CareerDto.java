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
public class CareerDto {
    private Long id;
    private String title;
    private String subtitle;
    private String whyJoinTitle;
    private String whyJoinDescription;
    private List<String> benefits;
    private List<Position> positions;
    private Boolean published;
    private Integer displayOrder;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Position {
        private String title;
        private String department;
        private String location;
        private String type;
        private String description;
    }

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static CareerDto fromEntity(Career entity) {
        if (entity == null) return null;

        return CareerDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .subtitle(entity.getSubtitle())
                .whyJoinTitle(entity.getWhyJoinTitle())
                .whyJoinDescription(entity.getWhyJoinDescription())
                .benefits(parseStringList(entity.getBenefits()))
                .positions(parsePositionList(entity.getPositions()))
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

    private static List<Position> parsePositionList(String json) {
        if (json == null || json.isEmpty()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<Position>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
}
