package com.uyirgene.course.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Configuration DTO for certificate template text positioning.
 * Coordinates are in PDF points (1 point = 1/72 inch).
 * Origin (0,0) is at bottom-left of the page.
 * A4 page size: 595 x 842 points
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@Slf4j
public class TemplateConfigDto {

    // Student name position
    @Builder.Default
    private TextElement studentName = TextElement.builder()
            .x(297.5f)  // Center of A4
            .y(500f)
            .fontSize(24)
            .fontColor("#2980B9")
            .centered(true)
            .visible(true)
            .build();

    // Course title position
    @Builder.Default
    private TextElement courseTitle = TextElement.builder()
            .x(297.5f)
            .y(420f)
            .fontSize(20)
            .fontColor("#2C3E50")
            .centered(true)
            .visible(true)
            .build();

    // Course code position (e.g., "COURSE-001")
    @Builder.Default
    private TextElement courseCode = TextElement.builder()
            .x(297.5f)
            .y(395f)
            .fontSize(10)
            .fontColor("#969696")
            .centered(true)
            .visible(true)
            .build();

    // Trainer name position
    @Builder.Default
    private TextElement trainerName = TextElement.builder()
            .x(297.5f)
            .y(280f)
            .fontSize(12)
            .fontColor("#636363")
            .centered(true)
            .visible(true)
            .build();

    // Course short description position
    @Builder.Default
    private TextElement shortDescription = TextElement.builder()
            .x(297.5f)
            .y(260f)
            .fontSize(10)
            .fontColor("#636363")
            .centered(true)
            .visible(false)  // Disabled by default as it may be long
            .build();

    // Issue date position
    @Builder.Default
    private TextElement issueDate = TextElement.builder()
            .x(297.5f)
            .y(350f)
            .fontSize(12)
            .fontColor("#636363")
            .centered(true)
            .visible(true)
            .build();

    // Certificate ID position
    @Builder.Default
    private TextElement certificateId = TextElement.builder()
            .x(297.5f)
            .y(320f)
            .fontSize(10)
            .fontColor("#969696")
            .centered(true)
            .visible(true)
            .build();

    // Marks/Score position (only shown if marks available)
    @Builder.Default
    private TextElement marks = TextElement.builder()
            .x(297.5f)
            .y(380f)
            .fontSize(12)
            .fontColor("#636363")
            .centered(true)
            .visible(true)
            .build();

    // QR Code position
    @Builder.Default
    private QRCodeElement qrCode = QRCodeElement.builder()
            .x(262.5f)  // Center - half of size
            .y(150f)
            .size(70)
            .visible(true)
            .build();

    // "Scan to verify" text under QR code
    @Builder.Default
    private TextElement scanText = TextElement.builder()
            .x(297.5f)
            .y(135f)
            .fontSize(8)
            .fontColor("#969696")
            .centered(true)
            .visible(true)
            .build();

    // Optional: Header/title text (if not using template's headerText)
    @Builder.Default
    private TextElement header = TextElement.builder()
            .x(297.5f)
            .y(700f)
            .fontSize(24)
            .fontColor("#2C3E50")
            .centered(true)
            .visible(false)  // Disabled by default, use template's headerText
            .build();

    // Optional: "This is to certify that" text
    @Builder.Default
    private TextElement certifyText = TextElement.builder()
            .x(297.5f)
            .y(540f)
            .fontSize(14)
            .fontColor("#636363")
            .centered(true)
            .visible(true)
            .text("This is to certify that")
            .build();

    // Optional: "has successfully completed" text
    @Builder.Default
    private TextElement completedText = TextElement.builder()
            .x(297.5f)
            .y(460f)
            .fontSize(14)
            .fontColor("#636363")
            .centered(true)
            .visible(true)
            .build();

    /**
     * Text element configuration
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TextElement {
        private float x;
        private float y;
        private int fontSize;
        private String fontColor;  // Hex color like "#2980B9"
        private boolean centered;
        private boolean visible;
        private String text;  // Optional fixed text (for certifyText, etc.)
    }

    /**
     * QR Code element configuration
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class QRCodeElement {
        private float x;
        private float y;
        private int size;
        private boolean visible;
    }

    /**
     * Parse JSON string to TemplateConfigDto
     */
    public static TemplateConfigDto fromJson(String json) {
        if (json == null || json.trim().isEmpty()) {
            return getDefault();
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(json, TemplateConfigDto.class);
        } catch (Exception e) {
            log.warn("Failed to parse template config JSON, using defaults: {}", e.getMessage());
            return getDefault();
        }
    }

    /**
     * Convert to JSON string
     */
    public String toJson() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(this);
        } catch (Exception e) {
            log.error("Failed to serialize template config to JSON", e);
            return "{}";
        }
    }

    /**
     * Get default configuration
     */
    public static TemplateConfigDto getDefault() {
        return TemplateConfigDto.builder().build();
    }

    /**
     * Parse hex color to RGB floats (0-1 range)
     */
    public static float[] parseColor(String hexColor) {
        if (hexColor == null || !hexColor.startsWith("#") || hexColor.length() < 7) {
            return new float[]{0f, 0f, 0f};  // Default to black
        }
        try {
            int r = Integer.parseInt(hexColor.substring(1, 3), 16);
            int g = Integer.parseInt(hexColor.substring(3, 5), 16);
            int b = Integer.parseInt(hexColor.substring(5, 7), 16);
            return new float[]{r / 255f, g / 255f, b / 255f};
        } catch (NumberFormatException e) {
            return new float[]{0f, 0f, 0f};
        }
    }
}
