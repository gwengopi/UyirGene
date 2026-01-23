package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateTemplateRepository extends JpaRepository<CertificateTemplate, Long> {

    // Find templates by type
    List<CertificateTemplate> findByTypeAndActiveTrue(Certificate.CertificateType type);

    // Find course-specific template
    Optional<CertificateTemplate> findByCourseAndTypeAndActiveTrue(Course course, Certificate.CertificateType type);

    // Find default global template by type
    Optional<CertificateTemplate> findByTypeAndIsDefaultTrueAndActiveTrue(Certificate.CertificateType type);

    // Find all active templates
    List<CertificateTemplate> findByActiveTrue();

    // Find all templates for a course
    List<CertificateTemplate> findByCourse(Course course);

    // Find global templates (no course association)
    List<CertificateTemplate> findByCourseIsNullAndActiveTrue();
}
