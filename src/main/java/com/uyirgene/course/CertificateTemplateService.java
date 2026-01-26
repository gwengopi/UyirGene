package com.uyirgene.course;

import com.uyirgene.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateTemplateService {

    private final CertificateTemplateRepository templateRepo;
    private final CourseRepository courseRepo;

    /**
     * Get all certificate templates
     */
    public List<CertificateTemplate> getAllTemplates() {
        return templateRepo.findAll();
    }

    /**
     * Get all active templates
     */
    public List<CertificateTemplate> getActiveTemplates() {
        return templateRepo.findByActiveTrue();
    }

    /**
     * Get template by ID
     */
    public CertificateTemplate getTemplate(Long id) {
        return templateRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Template not found with id: " + id));
    }

    /**
     * Get templates for a specific course
     */
    public List<CertificateTemplate> getTemplatesForCourse(Long courseId) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found"));
        return templateRepo.findByCourse(course);
    }

    /**
     * Get global templates (not associated with any course)
     */
    public List<CertificateTemplate> getGlobalTemplates() {
        return templateRepo.findByCourseIsNullAndActiveTrue();
    }

    /**
     * Find the appropriate template for a course and certificate type
     * Priority:
     * 1. Course-specific template with matching type
     * 2. Global default template with matching type (isDefault = true)
     * 3. Any active global template with matching type (fallback)
     */
    public Optional<CertificateTemplate> findTemplateForCertificate(Course course, Certificate.CertificateType type) {
        log.info("Looking for template for course {} and type {}", course.getId(), type);

        // First, try to find a course-specific template
        Optional<CertificateTemplate> courseTemplate = templateRepo.findByCourseAndTypeAndActiveTrue(course, type);
        if (courseTemplate.isPresent()) {
            log.info("Found course-specific template: {} (hasTemplateFile={})",
                courseTemplate.get().getName(),
                courseTemplate.get().getTemplateFile() != null && courseTemplate.get().getTemplateFile().length > 0);
            return courseTemplate;
        }
        log.info("No course-specific template found, checking for global default");

        // Fall back to global default template
        Optional<CertificateTemplate> globalTemplate = templateRepo.findByTypeAndIsDefaultTrueAndActiveTrue(type);
        if (globalTemplate.isPresent()) {
            log.info("Found global default template: {} (hasTemplateFile={})",
                globalTemplate.get().getName(),
                globalTemplate.get().getTemplateFile() != null && globalTemplate.get().getTemplateFile().length > 0);
            return globalTemplate;
        }
        log.info("No global default template found, checking for any active global template");

        // Fallback: Find any active global template (course = null) with matching type
        List<CertificateTemplate> globalTemplates = templateRepo.findByCourseIsNullAndActiveTrue();
        Optional<CertificateTemplate> anyGlobalTemplate = globalTemplates.stream()
                .filter(t -> t.getType() == type)
                .findFirst();
        if (anyGlobalTemplate.isPresent()) {
            log.info("Found fallback global template: {} (hasTemplateFile={})",
                anyGlobalTemplate.get().getName(),
                anyGlobalTemplate.get().getTemplateFile() != null && anyGlobalTemplate.get().getTemplateFile().length > 0);
            return anyGlobalTemplate;
        }

        log.info("No template found for type {}", type);
        return Optional.empty();
    }

    /**
     * Create a new certificate template
     */
    @Transactional
    public CertificateTemplate createTemplate(
            String name,
            Certificate.CertificateType type,
            Long courseId,
            String headerText,
            String bodyTemplate,
            String templateConfig,
            Boolean isDefault,
            MultipartFile templateFile,
            MultipartFile backgroundImage
    ) throws IOException {
        CertificateTemplate template = CertificateTemplate.builder()
                .name(name)
                .type(type)
                .headerText(headerText)
                .bodyTemplate(bodyTemplate)
                .templateConfig(templateConfig)
                .isDefault(isDefault != null ? isDefault : false)
                .active(true)
                .build();

        // Set course if provided
        if (courseId != null) {
            Course course = courseRepo.findById(courseId)
                    .orElseThrow(() -> new EntityNotFoundException("Course not found"));
            template.setCourse(course);
        }

        // Handle template file upload
        if (templateFile != null && !templateFile.isEmpty()) {
            byte[] fileBytes = templateFile.getBytes();
            template.setTemplateFile(fileBytes);
            template.setTemplateContentType(templateFile.getContentType());
            log.info("Template PDF uploaded: {} bytes, contentType={}", fileBytes.length, templateFile.getContentType());
        } else {
            log.info("No template PDF file provided");
        }

        // Handle background image upload
        if (backgroundImage != null && !backgroundImage.isEmpty()) {
            template.setBackgroundImage(backgroundImage.getBytes());
            template.setBackgroundImageContentType(backgroundImage.getContentType());
        }

        // If setting as default, unset other defaults of same type
        if (Boolean.TRUE.equals(isDefault)) {
            unsetOtherDefaults(type);
        }

        return templateRepo.save(template);
    }

    /**
     * Update an existing template
     */
    @Transactional
    public CertificateTemplate updateTemplate(
            Long id,
            String name,
            Certificate.CertificateType type,
            Long courseId,
            String headerText,
            String bodyTemplate,
            String templateConfig,
            Boolean isDefault,
            Boolean active,
            MultipartFile templateFile,
            MultipartFile backgroundImage,
            Boolean removeTemplateFile,
            Boolean removeBackgroundImage
    ) throws IOException {
        CertificateTemplate template = templateRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Template not found"));

        if (name != null) template.setName(name);
        if (type != null) template.setType(type);
        if (headerText != null) template.setHeaderText(headerText);
        if (bodyTemplate != null) template.setBodyTemplate(bodyTemplate);
        if (templateConfig != null) template.setTemplateConfig(templateConfig);
        if (active != null) template.setActive(active);

        // Update course association
        if (courseId != null) {
            Course course = courseRepo.findById(courseId)
                    .orElseThrow(() -> new EntityNotFoundException("Course not found"));
            template.setCourse(course);
        }

        // Handle template file
        if (Boolean.TRUE.equals(removeTemplateFile)) {
            log.info("Removing template PDF file");
            template.setTemplateFile(null);
            template.setTemplateContentType(null);
        } else if (templateFile != null && !templateFile.isEmpty()) {
            byte[] fileBytes = templateFile.getBytes();
            template.setTemplateFile(fileBytes);
            template.setTemplateContentType(templateFile.getContentType());
            log.info("Template PDF updated: {} bytes, contentType={}", fileBytes.length, templateFile.getContentType());
        }

        // Handle background image
        if (Boolean.TRUE.equals(removeBackgroundImage)) {
            template.setBackgroundImage(null);
            template.setBackgroundImageContentType(null);
        } else if (backgroundImage != null && !backgroundImage.isEmpty()) {
            template.setBackgroundImage(backgroundImage.getBytes());
            template.setBackgroundImageContentType(backgroundImage.getContentType());
        }

        // Handle default flag
        if (Boolean.TRUE.equals(isDefault) && !Boolean.TRUE.equals(template.getIsDefault())) {
            unsetOtherDefaults(template.getType());
            template.setIsDefault(true);
        } else if (isDefault != null) {
            template.setIsDefault(isDefault);
        }

        return templateRepo.save(template);
    }

    /**
     * Delete a template
     */
    @Transactional
    public void deleteTemplate(Long id) {
        if (!templateRepo.existsById(id)) {
            throw new EntityNotFoundException("Template not found");
        }
        templateRepo.deleteById(id);
    }

    /**
     * Set a template as the default for its type
     */
    @Transactional
    public CertificateTemplate setAsDefault(Long id) {
        CertificateTemplate template = templateRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Template not found"));

        unsetOtherDefaults(template.getType());
        template.setIsDefault(true);
        return templateRepo.save(template);
    }

    /**
     * Helper to unset default flag on other templates of the same type
     */
    private void unsetOtherDefaults(Certificate.CertificateType type) {
        List<CertificateTemplate> existingDefaults = templateRepo.findByTypeAndActiveTrue(type);
        for (CertificateTemplate t : existingDefaults) {
            if (Boolean.TRUE.equals(t.getIsDefault())) {
                t.setIsDefault(false);
                templateRepo.save(t);
            }
        }
    }
}
