package com.uyirgene.course.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uyirgene.course.Course;
import com.uyirgene.course.CoursePrice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDto {
    private Long id;
    private String courseCode;
    private String title;
    private String slug;
    private String tagline;
    private String shortDescription;
    private String description;
    private List<KeyComponent> keyComponents;
    private String targetAudience;
    private String assessment;
    private String outcome;
    private String courseDurationText;
    private List<String> examDetails;
    private List<String> categories;
    private Integer durationHours;
    private Double price;
    private Boolean published;
    private Boolean flagship;
    private Integer displayOrder;
    private String courseType;
    private String trainerName;

    // Thumbnail image (for course list)
    private boolean hasThumbnailImage;
    private String thumbnailImageUrl;

    // Description image (for course detail page)
    private boolean hasDescriptionImage;
    private String descriptionImageUrl;

    // Legacy image support
    private boolean hasImage;
    private String imageUrl;

    // Country-specific prices
    private List<CoursePriceDto> countryPrices;

    // Test/Assessment
    private String testLink;
    private String testDescription;

    /** JSON array of assessment links: [{"title":"...","url":"..."}] */
    private String assessmentLinks;

    /** JSON array of pre-assessment (practice) links: [{"title":"...","url":"..."}] */
    private String preAssessmentLinks;

    /** Admin-configurable instruction text shown above pre-assessment buttons */
    private String preAssessmentInstructions;

    // Completion reminder SLA (days after enrollment)
    private Integer reminderDays;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoursePriceDto {
        private String countryCode;
        private String currencyCode;
        private Double amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KeyComponent {
        private String title;
        private List<String> points;
    }

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private static List<String> parseStringList(String json) {
        if (json == null || json.isEmpty()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private static List<KeyComponent> parseKeyComponents(String json) {
        if (json == null || json.isEmpty()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<KeyComponent>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    public static CourseDto fromEntity(Course course) {
        // Check for thumbnail image (prefer thumbnailImagePath, fall back to legacy imagePath)
        boolean hasThumbnail = course.getThumbnailImagePath() != null || course.getImagePath() != null;
        boolean hasDescImg = course.getDescriptionImagePath() != null;
        boolean hasLegacyImg = course.getImagePath() != null;

        return CourseDto.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .title(course.getTitle())
                .slug(course.getSlug())
                .tagline(course.getTagline())
                .shortDescription(course.getShortDescription())
                .description(course.getDescription())
                .keyComponents(parseKeyComponents(course.getKeyComponents()))
                .targetAudience(course.getTargetAudience())
                .assessment(course.getAssessment())
                .outcome(course.getOutcome())
                .courseDurationText(course.getCourseDurationText())
                .examDetails(parseStringList(course.getExamDetails()))
                .categories(parseStringList(course.getCategory()))
                .durationHours(course.getDurationHours())
                .price(course.getPrice())
                .published(course.getPublished())
                .flagship(course.getFlagship())
                .displayOrder(course.getDisplayOrder())
                .courseType(course.getCourseType())
                .trainerName(course.getTrainerName())
                .hasThumbnailImage(hasThumbnail)
                .thumbnailImageUrl(hasThumbnail ? "/api/courses/" + course.getId() + "/thumbnail" : null)
                .hasDescriptionImage(hasDescImg)
                .descriptionImageUrl(hasDescImg ? "/api/courses/" + course.getId() + "/description-image" : null)
                // Legacy support
                .hasImage(hasLegacyImg)
                .imageUrl(hasLegacyImg ? "/api/courses/" + course.getId() + "/image" : null)
                .countryPrices(course.getCountryPrices() != null
                        ? course.getCountryPrices().stream()
                            .map(cp -> new CoursePriceDto(cp.getCountryCode(), cp.getCurrencyCode(), cp.getAmount()))
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .testLink(course.getTestLink())
                .testDescription(course.getTestDescription())
                .assessmentLinks(course.getAssessmentLinks())
                .preAssessmentLinks(course.getPreAssessmentLinks())
                .preAssessmentInstructions(course.getPreAssessmentInstructions())
                .reminderDays(course.getReminderDays())
                .build();
    }
}
