package com.uyirgene.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlagshipProgramDto {

    private Long id;
    private String title;
    private String tagline;
    private String slug;
    private String programCode;
    private String cardDescription;
    private String cardHighlights;
    private String sections;
    private Boolean active;
    private Integer displayOrder;
    private LocalDateTime createdAt;

    private boolean hasBackgroundImage;
    private String backgroundImageUrl;

    // Pricing
    private Double price;
    private List<PriceDto> countryPrices;

    // Trainer
    private String trainerName;

    // Links
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

    private String trainingDuration;

    // Content fields (mirrors Course)
    private String targetAudience;
    private String assessment;
    private String outcome;
    private String examDetails;

    // Videos (title/meta for display; URLs served encrypted via /api/flagship/{id}/videos)
    private List<VideoItem> videos;

    // Enrollment/certificate info (only populated by /enrolled endpoint, null in public responses)
    private String enrollmentStatus;
    private Boolean resultPublished;
    private Boolean hasCertificate;
    private Boolean canDownloadCertificate;
    private String certificateId;

    // ── Inner DTOs ───────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceDto {
        private String countryCode;
        private String currencyCode;
        private Double amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VideoItem {
        private Long id;
        private String title;
        private String url;          // plaintext — for admin editing; not shown to end users
        private Integer orderIndex;
        private Integer durationSeconds;
    }

    // ── Converter ────────────────────────────────────────────────────────────

    public static FlagshipProgramDto fromEntity(FlagshipProgram program) {
        boolean hasBg = program.getBackgroundImage() != null && program.getBackgroundImage().length > 0;
        boolean hasExternalUrl = program.getBackgroundImageUrl() != null && !program.getBackgroundImageUrl().isBlank();
        String bgUrl = hasBg
                ? "/api/flagship/" + program.getId() + "/image"
                : (hasExternalUrl ? program.getBackgroundImageUrl() : null);

        List<PriceDto> prices = Collections.emptyList();
        if (program.getCountryPrices() != null) {
            prices = program.getCountryPrices().stream()
                    .map(cp -> new PriceDto(cp.getCountryCode(), cp.getCurrencyCode(), cp.getAmount()))
                    .collect(Collectors.toList());
        }

        List<VideoItem> videoItems = Collections.emptyList();
        if (program.getVideos() != null) {
            videoItems = program.getVideos().stream()
                    .sorted(Comparator.comparingInt(v -> v.getOrderIndex() != null ? v.getOrderIndex() : 0))
                    .map(v -> new VideoItem(v.getId(), v.getTitle(), v.getUrl(), v.getOrderIndex(), v.getDurationSeconds()))
                    .collect(Collectors.toList());
        }

        return FlagshipProgramDto.builder()
                .id(program.getId())
                .title(program.getTitle())
                .tagline(program.getTagline())
                .slug(program.getSlug())
                .programCode(program.getProgramCode())
                .cardDescription(program.getCardDescription())
                .cardHighlights(program.getCardHighlights())
                .sections(program.getSections())
                .active(program.getActive())
                .displayOrder(program.getDisplayOrder())
                .createdAt(program.getCreatedAt())
                .hasBackgroundImage(hasBg || hasExternalUrl)
                .backgroundImageUrl(bgUrl)
                .price(program.getPrice())
                .countryPrices(prices)
                .trainerName(program.getTrainerName())
                .testLink(program.getTestLink())
                .testDescription(program.getTestDescription())
                .assessmentLinks(program.getAssessmentLinks())
                .preAssessmentLinks(program.getPreAssessmentLinks())
                .preAssessmentInstructions(program.getPreAssessmentInstructions())
                .reminderDays(program.getReminderDays())
                .trainingDuration(program.getTrainingDuration())
                .targetAudience(program.getTargetAudience())
                .assessment(program.getAssessment())
                .outcome(program.getOutcome())
                .examDetails(program.getExamDetails())
                .videos(videoItems)
                .build();
    }
}
