package com.uyirgene.course;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/standards")
@RequiredArgsConstructor
public class StandardController {

    private final StandardRepository repository;

    // ==================== Public ====================

    @GetMapping
    public ResponseEntity<List<StandardDto>> list(
            @RequestParam(value = "q", required = false) String q) {
        List<Standard> results = (q != null && !q.isBlank())
                ? repository.search(q.trim())
                : repository.findAllByOrderByDisplayOrderAscCreatedAtDesc();
        return ResponseEntity.ok(results.stream().map(StandardDto::fromEntity).toList());
    }

    // ==================== Download (authenticated) ====================

    @GetMapping("/{id}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> download(@PathVariable("id") Long id) {
        return repository.findById(id).map(s -> {
            if (s.getFileData() == null || s.getFileData().length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .<Object>body("Document not yet available");
            }
            String contentType = s.getFileContentType() != null
                    ? s.getFileContentType()
                    : "application/octet-stream";
            String disposition = "attachment; filename=\""
                    + (s.getFileName() != null ? s.getFileName() : "document") + "\"";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                    .contentType(MediaType.parseMediaType(contentType))
                    .contentLength(s.getFileData().length)
                    .<Object>body(s.getFileData());
        }).orElseGet(() -> ResponseEntity.notFound().<Object>build());
    }

    // ==================== Admin ====================

    @PostMapping(value = "/admin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardDto> create(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {
        Standard standard = Standard.builder()
                .title(title)
                .description(description)
                .category(category)
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .build();

        if (file != null && !file.isEmpty()) {
            String err = validateFile(file);
            if (err != null) return ResponseEntity.badRequest().build();
            standard.setFileData(file.getBytes());
            standard.setFileName(file.getOriginalFilename());
            standard.setFileContentType(file.getContentType());
            standard.setFileSize(file.getSize());
        }

        Standard saved = repository.save(standard);
        return ResponseEntity.created(URI.create("/api/standards/" + saved.getId()))
                .body(StandardDto.fromEntity(saved));
    }

    @PutMapping(value = "/admin/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<StandardDto> update(
            @PathVariable("id") Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "removeFile", defaultValue = "false") Boolean removeFile
    ) throws IOException {
        Standard existing = repository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();

        existing.setTitle(title);
        existing.setDescription(description);
        existing.setCategory(category);
        if (displayOrder != null) existing.setDisplayOrder(displayOrder);

        if (Boolean.TRUE.equals(removeFile)) {
            existing.setFileData(null);
            existing.setFileName(null);
            existing.setFileContentType(null);
            existing.setFileSize(null);
        } else if (file != null && !file.isEmpty()) {
            String err = validateFile(file);
            if (err != null) return ResponseEntity.badRequest().build();
            existing.setFileData(file.getBytes());
            existing.setFileName(file.getOriginalFilename());
            existing.setFileContentType(file.getContentType());
            existing.setFileSize(file.getSize());
        }

        return ResponseEntity.ok(StandardDto.fromEntity(repository.save(existing)));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Helpers ====================

    private static final Set<String> ALLOWED_FILE_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024; // 20 MB

    private String validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) return "File exceeds 20MB limit";
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_FILE_TYPES.contains(ct)) return "Unsupported file type";
        return null;
    }
}
