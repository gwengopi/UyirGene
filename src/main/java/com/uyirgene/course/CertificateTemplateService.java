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
     * First checks for course-specific template, then falls back to global default
     */
    public Optional<CertificateTemplate> findTemplateForCertificate(Course course, Certificate.CertificateType type) {
        // First, try to find a course-specific template
        Optional<CertificateTemplate> courseTemplate = templateRepo.findByCourseAndTypeAndActiveTrue(course, type);
        if (courseTemplate.isPresent()) {
            return courseTemplate;
        }

        // Fall back to global default template
        return templateRepo.findByTypeAndIsDefaultTrueAndActiveTrue(type);
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
            Boolean isDefault,
            MultipartFile templateFile,
            MultipartFile backgroundImage
    ) throws IOException {
        CertificateTemplate template = CertificateTemplate.builder()
                .name(name)
                .type(type)
                .headerText(headerText)
                .bodyTemplate(bodyTemplate)
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
            template.setTemplateFile(templateFile.getBytes());
            template.setTemplateContentType(templateFile.getContentType());
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
        if (active != null) template.setActive(active);

        // Update course association
        if (courseId != null) {
            Course course = courseRepo.findById(courseId)
                    .orElseThrow(() -> new EntityNotFoundException("Course not found"));
            template.setCourse(course);
        }

        // Handle template file
        if (Boolean.TRUE.equals(removeTemplateFile)) {
            template.setTemplateFile(null);
            template.setTemplateContentType(null);
        } else if (templateFile != null && !templateFile.isEmpty()) {
            template.setTemplateFile(templateFile.getBytes());
            template.setTemplateContentType(templateFile.getContentType());
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
