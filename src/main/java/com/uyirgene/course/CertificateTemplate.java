package com.uyirgene.course;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Entity for storing certificate templates.
 * Admin can create different templates for completion and participation certificates.
 * Templates can be course-specific or global (courseId = null).
 */
@Entity
@Table(name = "certificate_template")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CertificateTemplate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private Certificate.CertificateType type; // COMPLETION or PARTICIPATION

    // Optional: specific to a course. If null, it's a global template
    @ManyToOne
    private Course course;

    // Template as PDF/image stored as binary
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BYTEA")
    private byte[] templateFile;
    private String templateContentType;

    // Background image for the certificate
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BYTEA")
    private byte[] backgroundImage;
    private String backgroundImageContentType;

    // Template configuration as JSON (positions, fonts, colors, etc.)
    @Column(columnDefinition = "TEXT")
    private String templateConfig;

    // Header text (e.g., "Certificate of Completion" or "Certificate of Participation")
    private String headerText;

    // Body text template (with placeholders like {{name}}, {{course}}, {{date}})
    @Column(columnDefinition = "TEXT")
    private String bodyTemplate;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private Boolean isDefault = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
