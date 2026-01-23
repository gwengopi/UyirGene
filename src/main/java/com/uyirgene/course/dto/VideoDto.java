package com.uyirgene.course.dto;

import com.uyirgene.course.Video;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for video data with encrypted URL.
 * The actual video URL is encrypted to prevent direct access/disclosure.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoDto {
    private Long id;
    private Long courseId;
    private String title;
    private String encryptedUrl;  // Encrypted video URL
    private Integer orderIndex;
    private Integer durationSeconds;

    public static VideoDto fromEntity(Video video, String encryptedUrl) {
        return VideoDto.builder()
                .id(video.getId())
                .courseId(video.getCourse() != null ? video.getCourse().getId() : null)
                .title(video.getTitle())
                .encryptedUrl(encryptedUrl)
                .orderIndex(video.getOrderIndex())
                .durationSeconds(video.getDurationSeconds())
                .build();
    }
}
