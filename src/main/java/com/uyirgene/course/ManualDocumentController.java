package com.uyirgene.course;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ManualDocumentController {

    private final ManualDocumentRepository manualRepo;
    private final CourseRepository courseRepo;
    private final FlagshipProgramRepository flagshipRepo;

    // ── Course manuals ────────────────────────────────────────────────────────

    @GetMapping("/api/courses/{courseId}/manuals")
    @PreAuthorize("isAuthenticated()")
    public List<ManualDto> getCourseManuals(@PathVariable Long courseId) {
        return manualRepo.findByCourse_IdOrderByDisplayOrderAscCreatedAtAsc(courseId)
                .stream().map(ManualDto::from).toList();
    }

    @PostMapping("/api/courses/{courseId}/manuals")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ManualDto> uploadCourseManual(
            @PathVariable Long courseId,
            @RequestParam String label,
            @RequestParam(defaultValue = "0") int displayOrder,
            @RequestParam MultipartFile file) throws IOException {
        validateManualFile(file);
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        ManualDocument manual = ManualDocument.builder()
                .course(course)
                .label(label.trim())
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .fileData(file.getBytes())
                .displayOrder(displayOrder)
                .createdAt(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(ManualDto.from(manualRepo.save(manual)));
    }

    @DeleteMapping("/api/courses/{courseId}/manuals/{manualId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourseManual(
            @PathVariable Long courseId,
            @PathVariable Long manualId) {
        manualRepo.findByIdAndCourse_Id(manualId, courseId).ifPresent(manualRepo::delete);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/courses/{courseId}/manuals/{manualId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadCourseManual(
            @PathVariable Long courseId,
            @PathVariable Long manualId) {
        ManualDocument manual = manualRepo.findByIdAndCourse_Id(manualId, courseId)
                .orElseThrow(() -> new RuntimeException("Manual not found"));
        return buildDownloadResponse(manual);
    }

    // ── Flagship manuals ──────────────────────────────────────────────────────

    @GetMapping("/api/flagship/{programId}/manuals")
    @PreAuthorize("isAuthenticated()")
    public List<ManualDto> getFlagshipManuals(@PathVariable Long programId) {
        return manualRepo.findByFlagshipProgram_IdOrderByDisplayOrderAscCreatedAtAsc(programId)
                .stream().map(ManualDto::from).toList();
    }

    @PostMapping("/api/flagship/{programId}/manuals")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ManualDto> uploadFlagshipManual(
            @PathVariable Long programId,
            @RequestParam String label,
            @RequestParam(defaultValue = "0") int displayOrder,
            @RequestParam MultipartFile file) throws IOException {
        validateManualFile(file);
        FlagshipProgram program = flagshipRepo.findById(programId)
                .orElseThrow(() -> new RuntimeException("Flagship program not found"));
        ManualDocument manual = ManualDocument.builder()
                .flagshipProgram(program)
                .label(label.trim())
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .fileData(file.getBytes())
                .displayOrder(displayOrder)
                .createdAt(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(ManualDto.from(manualRepo.save(manual)));
    }

    @DeleteMapping("/api/flagship/{programId}/manuals/{manualId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFlagshipManual(
            @PathVariable Long programId,
            @PathVariable Long manualId) {
        manualRepo.findByIdAndFlagshipProgram_Id(manualId, programId).ifPresent(manualRepo::delete);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/flagship/{programId}/manuals/{manualId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadFlagshipManual(
            @PathVariable Long programId,
            @PathVariable Long manualId) {
        ManualDocument manual = manualRepo.findByIdAndFlagshipProgram_Id(manualId, programId)
                .orElseThrow(() -> new RuntimeException("Manual not found"));
        return buildDownloadResponse(manual);
    }

    private static final long MAX_MANUAL_SIZE = 20L * 1024 * 1024; // 20 MB

    private void validateManualFile(MultipartFile file) {
        if (file.getSize() > MAX_MANUAL_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "File size (" + String.format("%.1f", file.getSize() / (1024.0 * 1024.0)) + " MB) exceeds the 20 MB limit. Please compress the file and try again.");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ResponseEntity<byte[]> buildDownloadResponse(ManualDocument manual) {
        String contentType = manual.getContentType() != null
                ? manual.getContentType() : "application/octet-stream";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + manual.getFileName() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(manual.getFileData());
    }

    // ── DTO ───────────────────────────────────────────────────────────────────

    public record ManualDto(
            Long id, String label, String fileName,
            Long fileSize, String contentType,
            int displayOrder, LocalDateTime createdAt) {
        static ManualDto from(ManualDocument m) {
            return new ManualDto(m.getId(), m.getLabel(), m.getFileName(),
                    m.getFileSize(), m.getContentType(), m.getDisplayOrder(), m.getCreatedAt());
        }
    }
}
