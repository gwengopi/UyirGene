package com.uyirgene.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/service-testings")
@RequiredArgsConstructor
@Slf4j
public class ServiceTestingController {
    private final ServiceTestingService service;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== Public Endpoints ====================

    @GetMapping
    @Operation(summary = "List all published service testings")
    @ApiResponse(responseCode = "200", description = "List of published testings")
    public ResponseEntity<List<ServiceTestingDto>> listPublished() {
        return ResponseEntity.ok(service.getAllPublished());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a service testing by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Testing found"),
            @ApiResponse(responseCode = "404", description = "Testing not found")
    })
    public ResponseEntity<ServiceTestingDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/{id}/thumbnail")
    @Operation(summary = "Get testing thumbnail image")
    public ResponseEntity<byte[]> getThumbnail(@PathVariable Long id) {
        ServiceTesting entity = service.getEntityById(id);
        if (entity.getThumbnailImage() == null || entity.getThumbnailImage().length == 0) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                entity.getThumbnailImageContentType() != null ? entity.getThumbnailImageContentType() : "image/jpeg"
        ));
        headers.setContentLength(entity.getThumbnailImage().length);

        return new ResponseEntity<>(entity.getThumbnailImage(), headers, HttpStatus.OK);
    }

    @GetMapping("/{id}/hero-image")
    @Operation(summary = "Get testing hero image")
    public ResponseEntity<byte[]> getHeroImage(@PathVariable Long id) {
        ServiceTesting entity = service.getEntityById(id);
        if (entity.getHeroImage() == null || entity.getHeroImage().length == 0) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                entity.getHeroImageContentType() != null ? entity.getHeroImageContentType() : "image/jpeg"
        ));
        headers.setContentLength(entity.getHeroImage().length);

        return new ResponseEntity<>(entity.getHeroImage(), headers, HttpStatus.OK);
    }

    // ==================== Admin Endpoints ====================

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all service testings (admin)")
    public ResponseEntity<List<ServiceTestingDto>> listAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new service testing")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Testing created"),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<ServiceTestingDto> create(
            @RequestParam("title") String title,
            @RequestParam(value = "subtitle", required = false) String subtitle,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "whatIs", required = false) String whatIs,
            @RequestParam(value = "whyMatters", required = false) String whyMatters,
            @RequestParam(value = "certificate", required = false) String certificate,
            @RequestParam(value = "testingServices", required = false) String testingServicesJson,
            @RequestParam(value = "highlights", required = false) String highlightsJson,
            @RequestParam(value = "published", defaultValue = "false") Boolean published,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "heroImage", required = false) MultipartFile heroImage
    ) throws IOException {
        List<String> testingServices = parseStringList(testingServicesJson);
        List<ServiceTestingDto.Highlight> highlights = parseHighlightList(highlightsJson);

        ServiceTestingDto created = service.create(
                title, subtitle, description, whatIs, whyMatters, certificate,
                testingServices, highlights,
                published, displayOrder, thumbnailImage, heroImage
        );

        return ResponseEntity.created(URI.create("/api/service-testings/" + created.getId()))
                .body(created);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a service testing")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Testing updated"),
            @ApiResponse(responseCode = "404", description = "Testing not found")
    })
    public ResponseEntity<ServiceTestingDto> update(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "subtitle", required = false) String subtitle,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "whatIs", required = false) String whatIs,
            @RequestParam(value = "whyMatters", required = false) String whyMatters,
            @RequestParam(value = "certificate", required = false) String certificate,
            @RequestParam(value = "testingServices", required = false) String testingServicesJson,
            @RequestParam(value = "highlights", required = false) String highlightsJson,
            @RequestParam(value = "published", defaultValue = "false") Boolean published,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "heroImage", required = false) MultipartFile heroImage,
            @RequestParam(value = "removeThumbnail", defaultValue = "false") Boolean removeThumbnail,
            @RequestParam(value = "removeHeroImage", defaultValue = "false") Boolean removeHeroImage
    ) throws IOException {
        List<String> testingServices = parseStringList(testingServicesJson);
        List<ServiceTestingDto.Highlight> highlights = parseHighlightList(highlightsJson);

        ServiceTestingDto updated = service.update(
                id, title, subtitle, description, whatIs, whyMatters, certificate,
                testingServices, highlights,
                published, displayOrder, thumbnailImage, heroImage,
                removeThumbnail, removeHeroImage
        );

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a service testing")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Testing deleted"),
            @ApiResponse(responseCode = "404", description = "Testing not found")
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Helper Methods ====================

    private List<String> parseStringList(String json) {
        if (json == null || json.isEmpty()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse JSON string list: {}", e.getMessage());
            return null;
        }
    }

    private List<ServiceTestingDto.Highlight> parseHighlightList(String json) {
        if (json == null || json.isEmpty()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<List<ServiceTestingDto.Highlight>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse JSON highlight list: {}", e.getMessage());
            return null;
        }
    }
}
