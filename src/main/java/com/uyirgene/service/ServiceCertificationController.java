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
@RequestMapping("/api/service-certifications")
@RequiredArgsConstructor
@Slf4j
public class ServiceCertificationController {
    private final ServiceCertificationService service;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== Public Endpoints ====================

    @GetMapping
    @Operation(summary = "List all published service certifications")
    @ApiResponse(responseCode = "200", description = "List of published certifications")
    public ResponseEntity<List<ServiceCertificationDto>> listPublished() {
        return ResponseEntity.ok(service.getAllPublished());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a service certification by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Certification found"),
            @ApiResponse(responseCode = "404", description = "Certification not found")
    })
    public ResponseEntity<ServiceCertificationDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/{id}/thumbnail")
    @Operation(summary = "Get certification thumbnail image")
    public ResponseEntity<byte[]> getThumbnail(@PathVariable Long id) {
        ServiceCertification entity = service.getEntityById(id);
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
    @Operation(summary = "Get certification hero image")
    public ResponseEntity<byte[]> getHeroImage(@PathVariable Long id) {
        ServiceCertification entity = service.getEntityById(id);
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
    @Operation(summary = "List all service certifications (admin)")
    public ResponseEntity<List<ServiceCertificationDto>> listAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new service certification")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Certification created"),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<ServiceCertificationDto> create(
            @RequestParam("title") String title,
            @RequestParam(value = "subtitle", required = false) String subtitle,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "whatIs", required = false) String whatIs,
            @RequestParam(value = "keyElements", required = false) String keyElementsJson,
            @RequestParam(value = "whoNeeds", required = false) String whoNeedsJson,
            @RequestParam(value = "certificationRoute", required = false) String certificationRouteJson,
            @RequestParam(value = "benefits", required = false) String benefitsJson,
            @RequestParam(value = "published", defaultValue = "false") Boolean published,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "heroImage", required = false) MultipartFile heroImage
    ) throws IOException {
        List<String> keyElements = parseStringList(keyElementsJson);
        List<String> whoNeeds = parseStringList(whoNeedsJson);
        List<ServiceCertificationDto.CertificationStep> certificationRoute = parseStepList(certificationRouteJson);
        List<String> benefits = parseStringList(benefitsJson);

        ServiceCertificationDto created = service.create(
                title, subtitle, description, whatIs,
                keyElements, whoNeeds, certificationRoute, benefits,
                published, displayOrder, thumbnailImage, heroImage
        );

        return ResponseEntity.created(URI.create("/api/service-certifications/" + created.getId()))
                .body(created);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a service certification")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Certification updated"),
            @ApiResponse(responseCode = "404", description = "Certification not found")
    })
    public ResponseEntity<ServiceCertificationDto> update(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "subtitle", required = false) String subtitle,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "whatIs", required = false) String whatIs,
            @RequestParam(value = "keyElements", required = false) String keyElementsJson,
            @RequestParam(value = "whoNeeds", required = false) String whoNeedsJson,
            @RequestParam(value = "certificationRoute", required = false) String certificationRouteJson,
            @RequestParam(value = "benefits", required = false) String benefitsJson,
            @RequestParam(value = "published", defaultValue = "false") Boolean published,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "heroImage", required = false) MultipartFile heroImage,
            @RequestParam(value = "removeThumbnail", defaultValue = "false") Boolean removeThumbnail,
            @RequestParam(value = "removeHeroImage", defaultValue = "false") Boolean removeHeroImage
    ) throws IOException {
        List<String> keyElements = parseStringList(keyElementsJson);
        List<String> whoNeeds = parseStringList(whoNeedsJson);
        List<ServiceCertificationDto.CertificationStep> certificationRoute = parseStepList(certificationRouteJson);
        List<String> benefits = parseStringList(benefitsJson);

        ServiceCertificationDto updated = service.update(
                id, title, subtitle, description, whatIs,
                keyElements, whoNeeds, certificationRoute, benefits,
                published, displayOrder, thumbnailImage, heroImage,
                removeThumbnail, removeHeroImage
        );

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a service certification")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Certification deleted"),
            @ApiResponse(responseCode = "404", description = "Certification not found")
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

    private List<ServiceCertificationDto.CertificationStep> parseStepList(String json) {
        if (json == null || json.isEmpty()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<List<ServiceCertificationDto.CertificationStep>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse JSON step list: {}", e.getMessage());
            return null;
        }
    }
}
