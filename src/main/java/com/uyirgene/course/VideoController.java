package com.uyirgene.course;

import com.uyirgene.course.dto.VideoDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class VideoController {
    private final VideoService videoService;
    private final VideoProgressService progressService;

    @GetMapping("/api/courses/{id}/videos")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List videos for a course with encrypted URLs")
    @ApiResponse(responseCode = "200", description = "List of videos with encrypted URLs")
    public ResponseEntity<List<VideoDto>> listVideos(@PathVariable("id") Long id) {
        return ResponseEntity.ok(videoService.listCourseVideosEncrypted(id));
    }

    @PostMapping("/api/videos/decrypt")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Decrypt video URL for playback (requires authentication)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "URL decrypted"),
            @ApiResponse(responseCode = "400", description = "Invalid encrypted URL")
    })
    public ResponseEntity<DecryptedUrlResponse> decryptVideoUrl(@RequestBody DecryptUrlRequest request) {
        try {
            String decryptedUrl = videoService.decryptVideoUrl(request.getEncryptedUrl());
            return ResponseEntity.ok(new DecryptedUrlResponse(decryptedUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/api/videos/{id}/progress")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update last played position for a video")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Progress updated"),
            @ApiResponse(responseCode = "404", description = "Video or enrollment not found")
    })
    public ResponseEntity<VideoProgress> updateProgress(@PathVariable("id") Long id, @RequestBody ProgressUpdateDto dto) {
        VideoProgress p = progressService.updateProgress(id, dto.getLastPositionSeconds(), Boolean.TRUE.equals(dto.getCompleted()));
        return ResponseEntity.ok(p);
    }

    @GetMapping("/api/videos/{id}/progress")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get last played position for a video")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Progress found"),
            @ApiResponse(responseCode = "404", description = "Progress not found")
    })
    public ResponseEntity<VideoProgress> getProgress(@PathVariable("id") Long id) {
        VideoProgress p = progressService.getProgress(id);
        if (p == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(p);
    }

    @Data
    public static class DecryptUrlRequest {
        private String encryptedUrl;
    }

    @Data
    public static class DecryptedUrlResponse {
        private String url;

        public DecryptedUrlResponse(String url) {
            this.url = url;
        }
    }

    public static class ProgressUpdateDto {
        private Long lastPositionSeconds;
        private Boolean completed;

        public Long getLastPositionSeconds() { return lastPositionSeconds; }
        public void setLastPositionSeconds(Long lastPositionSeconds) { this.lastPositionSeconds = lastPositionSeconds; }
        public Boolean getCompleted() { return completed; }
        public void setCompleted(Boolean completed) { this.completed = completed; }
    }
}