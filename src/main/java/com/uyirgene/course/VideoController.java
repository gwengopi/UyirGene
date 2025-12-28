package com.uyirgene.course;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class VideoController {
    private final VideoService videoService;
    private final VideoProgressService progressService;

    @GetMapping("/api/courses/{id}/videos")
    @Operation(summary = "List videos for a course")
    @ApiResponse(responseCode = "200", description = "List of videos")
    public ResponseEntity<List<Video>> listVideos(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.listCourseVideos(id));
    }

    @PostMapping("/api/videos/{id}/progress")
    @Operation(summary = "Update last played position for a video")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Progress updated"),
            @ApiResponse(responseCode = "404", description = "Video or enrollment not found")
    })
    public ResponseEntity<VideoProgress> updateProgress(@PathVariable Long id, @RequestBody ProgressUpdateDto dto) {
        VideoProgress p = progressService.updateProgress(id, dto.getLastPositionSeconds());
        return ResponseEntity.ok(p);
    }

    @GetMapping("/api/videos/{id}/progress")
    @Operation(summary = "Get last played position for a video")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Progress found"),
            @ApiResponse(responseCode = "404", description = "Progress not found")
    })
    public ResponseEntity<VideoProgress> getProgress(@PathVariable Long id) {
        VideoProgress p = progressService.getProgress(id);
        if (p == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(p);
    }

    public static class ProgressUpdateDto {
        private Long lastPositionSeconds;

        public Long getLastPositionSeconds() { return lastPositionSeconds; }
        public void setLastPositionSeconds(Long lastPositionSeconds) { this.lastPositionSeconds = lastPositionSeconds; }
    }
}