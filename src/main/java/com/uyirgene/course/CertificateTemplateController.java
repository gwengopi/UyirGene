package com.uyirgene.course;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/certificate-templates")
@RequiredArgsConstructor
public class CertificateTemplateController {

    private final CertificateTemplateService templateService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all certificate templates")
    @ApiResponse(responseCode = "200", description = "List of templates")
    public ResponseEntity<List<TemplateDto>> getAllTemplates() {
        List<TemplateDto> templates = templateService.getAllTemplates().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all active certificate templates")
    public ResponseEntity<List<TemplateDto>> getActiveTemplates() {
        List<TemplateDto> templates = templateService.getActiveTemplates().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get a certificate template by ID")
    public ResponseEntity<TemplateDto> getTemplate(@PathVariable Long id) {
        CertificateTemplate template = templateService.getTemplate(id);
        return ResponseEntity.ok(toDto(template));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get templates for a specific course")
    public ResponseEntity<List<TemplateDto>> getTemplatesForCourse(@PathVariable Long courseId) {
        List<TemplateDto> templates = templateService.getTemplatesForCourse(courseId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/global")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get global templates (not course-specific)")
    public ResponseEntity<List<TemplateDto>> getGlobalTemplates() {
        List<TemplateDto> templates = templateService.getGlobalTemplates().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(templates);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new certificate template")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Template created"),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<TemplateDto> createTemplate(
            @RequestParam("name") String name,
            @RequestParam("type") Certificate.CertificateType type,
            @RequestParam(value = "courseId", required = false) Long courseId,
            @RequestParam(value = "headerText", required = false) String headerText,
            @RequestParam(value = "bodyTemplate", required = false) String bodyTemplate,
            @RequestParam(value = "isDefault", defaultValue = "false") Boolean isDefault,
            @RequestParam(value = "templateFile", required = false) MultipartFile templateFile,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage
    ) throws IOException {
        CertificateTemplate template = templateService.createTemplate(
                name, type, courseId, headerText, bodyTemplate, isDefault, templateFile, backgroundImage
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(template));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a certificate template")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Template updated"),
            @ApiResponse(responseCode = "404", description = "Template not found")
    })
    public ResponseEntity<TemplateDto> updateTemplate(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "type", required = false) Certificate.CertificateType type,
            @RequestParam(value = "courseId", required = false) Long courseId,
            @RequestParam(value = "headerText", required = false) String headerText,
            @RequestParam(value = "bodyTemplate", required = false) String bodyTemplate,
            @RequestParam(value = "isDefault", required = false) Boolean isDefault,
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "templateFile", required = false) MultipartFile templateFile,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage,
            @RequestParam(value = "removeTemplateFile", defaultValue = "false") Boolean removeTemplateFile,
            @RequestParam(value = "removeBackgroundImage", defaultValue = "false") Boolean removeBackgroundImage
    ) throws IOException {
        CertificateTemplate template = templateService.updateTemplate(
                id, name, type, courseId, headerText, bodyTemplate, isDefault, active,
                templateFile, backgroundImage, removeTemplateFile, removeBackgroundImage
        );
        return ResponseEntity.ok(toDto(template));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a certificate template")
    @ApiResponse(responseCode = "204", description = "Template deleted")
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/set-default")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Set a template as the default for its type")
    public ResponseEntity<TemplateDto> setAsDefault(@PathVariable Long id) {
        CertificateTemplate template = templateService.setAsDefault(id);
        return ResponseEntity.ok(toDto(template));
    }

    @GetMapping("/{id}/template-file")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Download the template file")
    public ResponseEntity<byte[]> getTemplateFile(@PathVariable Long id) {
        CertificateTemplate template = templateService.getTemplate(id);
        if (template.getTemplateFile() == null) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                template.getTemplateContentType() != null ? template.getTemplateContentType() : "application/pdf"
        ));
        headers.setContentLength(template.getTemplateFile().length);
        headers.setContentDispositionFormData("attachment", "template-" + id + ".pdf");

        return new ResponseEntity<>(template.getTemplateFile(), headers, HttpStatus.OK);
    }

    @GetMapping("/{id}/background-image")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get the background image")
    public ResponseEntity<byte[]> getBackgroundImage(@PathVariable Long id) {
        CertificateTemplate template = templateService.getTemplate(id);
        if (template.getBackgroundImage() == null) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                template.getBackgroundImageContentType() != null ? template.getBackgroundImageContentType() : "image/png"
        ));
        headers.setContentLength(template.getBackgroundImage().length);

        return new ResponseEntity<>(template.getBackgroundImage(), headers, HttpStatus.OK);
    }

    private TemplateDto toDto(CertificateTemplate template) {
        return TemplateDto.builder()
                .id(template.getId())
                .name(template.getName())
                .type(template.getType() != null ? template.getType().name() : null)
                .courseId(template.getCourse() != null ? template.getCourse().getId() : null)
                .courseName(template.getCourse() != null ? template.getCourse().getTitle() : null)
                .headerText(template.getHeaderText())
                .bodyTemplate(template.getBodyTemplate())
                .hasTemplateFile(template.getTemplateFile() != null && template.getTemplateFile().length > 0)
                .hasBackgroundImage(template.getBackgroundImage() != null && template.getBackgroundImage().length > 0)
                .templateFileUrl(template.getTemplateFile() != null ? "/api/admin/certificate-templates/" + template.getId() + "/template-file" : null)
                .backgroundImageUrl(template.getBackgroundImage() != null ? "/api/admin/certificate-templates/" + template.getId() + "/background-image" : null)
                .isDefault(template.getIsDefault())
                .active(template.getActive())
                .createdAt(template.getCreatedAt() != null ? template.getCreatedAt().toString() : null)
                .updatedAt(template.getUpdatedAt() != null ? template.getUpdatedAt().toString() : null)
                .build();
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class TemplateDto {
        private Long id;
        private String name;
        private String type;
        private Long courseId;
        private String courseName;
        private String headerText;
        private String bodyTemplate;
        private boolean hasTemplateFile;
        private boolean hasBackgroundImage;
        private String templateFileUrl;
        private String backgroundImageUrl;
        private Boolean isDefault;
        private Boolean active;
        private String createdAt;
        private String updatedAt;
    }
}
