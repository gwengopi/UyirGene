package com.uyirgene.course.dto;

import com.uyirgene.course.CourseBundle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseBundleDto {
    private Long id;
    private String bundleCode;
    private String title;
    private String description;
    private Double price;
    private Double originalPrice;
    private Integer savingsPercent;
    private Boolean published;
    private Integer displayOrder;
    private LocalDateTime createdAt;

    private String category;

    private boolean hasThumbnailImage;
    private String thumbnailImageUrl;

    private List<BundleCourseDto> courses;
    private List<BundlePriceDto> countryPrices;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BundleCourseDto {
        private Long id;
        private String courseCode;
        private String title;
        private String shortDescription;
        private String category;
        private Integer durationHours;
        private Double price;
        private String courseType;
        private boolean hasThumbnailImage;
        private String thumbnailImageUrl;
        private List<BundlePriceDto> countryPrices;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BundlePriceDto {
        private String countryCode;
        private String currencyCode;
        private Double amount;
    }

    public static CourseBundleDto fromEntity(CourseBundle bundle) {
        boolean hasThumbnail = bundle.getThumbnailImage() != null && bundle.getThumbnailImage().length > 0;

        Integer savings = null;
        if (bundle.getOriginalPrice() != null && bundle.getOriginalPrice() > 0 && bundle.getPrice() != null) {
            savings = (int) Math.round((1 - bundle.getPrice() / bundle.getOriginalPrice()) * 100);
        }

        return CourseBundleDto.builder()
                .id(bundle.getId())
                .bundleCode(bundle.getBundleCode())
                .title(bundle.getTitle())
                .description(bundle.getDescription())
                .price(bundle.getPrice())
                .originalPrice(bundle.getOriginalPrice())
                .savingsPercent(savings)
                .published(bundle.getPublished())
                .displayOrder(bundle.getDisplayOrder())
                .createdAt(bundle.getCreatedAt())
                .category(bundle.getCategory())
                .hasThumbnailImage(hasThumbnail)
                .thumbnailImageUrl(hasThumbnail ? "/api/bundles/" + bundle.getId() + "/thumbnail" : null)
                .courses(bundle.getCourses() != null
                        ? bundle.getCourses().stream().map(c -> {
                            boolean courseHasThumbnail = (c.getThumbnailImage() != null && c.getThumbnailImage().length > 0)
                                    || (c.getImage() != null && c.getImage().length > 0);
                            return new BundleCourseDto(
                                    c.getId(),
                                    c.getCourseCode(),
                                    c.getTitle(),
                                    c.getShortDescription(),
                                    c.getCategory(),
                                    c.getDurationHours(),
                                    c.getPrice(),
                                    c.getCourseType(),
                                    courseHasThumbnail,
                                    courseHasThumbnail ? "/api/courses/" + c.getId() + "/thumbnail" : null,
                                    c.getCountryPrices() != null
                                            ? c.getCountryPrices().stream()
                                                .map(cp -> new BundlePriceDto(cp.getCountryCode(), cp.getCurrencyCode(), cp.getAmount()))
                                                .collect(Collectors.toList())
                                            : Collections.emptyList()
                            );
                        }).collect(Collectors.toList())
                        : Collections.emptyList())
                .countryPrices(bundle.getCountryPrices() != null
                        ? bundle.getCountryPrices().stream()
                            .map(bp -> new BundlePriceDto(bp.getCountryCode(), bp.getCurrencyCode(), bp.getAmount()))
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }
}
