package com.uyirgene.course.dto;

import com.uyirgene.course.Course;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Integer durationHours;
    private Double price;
    private Boolean published;

    // Thumbnail image (for course list)
    private boolean hasThumbnailImage;
    private String thumbnailImageUrl;

    // Description image (for course detail page)
    private boolean hasDescriptionImage;
    private String descriptionImageUrl;

    // Legacy image support
    private boolean hasImage;
    private String imageUrl;

    // Test/Assessment
    private String testLink;
    private String testDescription;

    public static CourseDto fromEntity(Course course) {
        // Check for thumbnail image (prefer thumbnailImage, fall back to legacy image)
        boolean hasThumbnail = (course.getThumbnailImage() != null && course.getThumbnailImage().length > 0)
                || (course.getImage() != null && course.getImage().length > 0);
        boolean hasDescImg = course.getDescriptionImage() != null && course.getDescriptionImage().length > 0;
        boolean hasLegacyImg = course.getImage() != null && course.getImage().length > 0;

        return CourseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .category(course.getCategory())
                .durationHours(course.getDurationHours())
                .price(course.getPrice())
                .published(course.getPublished())
                .hasThumbnailImage(hasThumbnail)
                .thumbnailImageUrl(hasThumbnail ? "/api/courses/" + course.getId() + "/thumbnail" : null)
                .hasDescriptionImage(hasDescImg)
                .descriptionImageUrl(hasDescImg ? "/api/courses/" + course.getId() + "/description-image" : null)
                // Legacy support
                .hasImage(hasLegacyImg)
                .imageUrl(hasLegacyImg ? "/api/courses/" + course.getId() + "/image" : null)
                .testLink(course.getTestLink())
                .testDescription(course.getTestDescription())
                .build();
    }
}
