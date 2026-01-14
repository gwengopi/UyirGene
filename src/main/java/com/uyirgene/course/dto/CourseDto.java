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
    private boolean hasImage;
    private String imageUrl;

    public static CourseDto fromEntity(Course course) {
        boolean hasImg = course.getImage() != null && course.getImage().length > 0;
        return CourseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .category(course.getCategory())
                .durationHours(course.getDurationHours())
                .price(course.getPrice())
                .published(course.getPublished())
                .hasImage(hasImg)
                .imageUrl(hasImg ? "/api/courses/" + course.getId() + "/image" : null)
                .build();
    }
}
