package com.uyirgene.course;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "flagship_program")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FlagshipProgram {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 255)
    private String tagline;

    @Column(unique = true, nullable = false, length = 255)
    private String slug;

    @Column(name = "program_code", unique = true, length = 50)
    private String programCode;

    @Column(name = "card_description", columnDefinition = "TEXT")
    private String cardDescription;

    /** JSON array of strings: ["5 Days / 40 Hrs", "Certificate Provided"] */
    @Column(name = "card_highlights", columnDefinition = "TEXT")
    private String cardHighlights;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "background_image", columnDefinition = "BYTEA")
    private byte[] backgroundImage;

    @Column(name = "background_image_content_type", length = 100)
    private String backgroundImageContentType;

    /** External image URL used as fallback when no uploaded BYTEA image is present */
    @Column(name = "background_image_url", length = 500)
    private String backgroundImageUrl;

    /** Base price in INR */
    @Column(name = "price")
    private Double price;

    /** Trainer / instructor name — used as default on certificates */
    @Column(name = "trainer_name", length = 255)
    private String trainerName;

    /** Assessment / exam link */
    @Column(name = "test_link", length = 1000)
    private String testLink;

    /** Description shown next to the test link (e.g. eligibility, what to expect) */
    @Column(name = "test_description", columnDefinition = "TEXT")
    private String testDescription;

    /** JSON array of assessment links: [{"title":"...","url":"..."}] */
    @Column(name = "assessment_links", columnDefinition = "TEXT")
    private String assessmentLinks;

    /** JSON array of pre-assessment (practice) links: [{"title":"...","url":"..."}] */
    @Column(name = "pre_assessment_links", columnDefinition = "TEXT")
    private String preAssessmentLinks;

    /** Admin-configurable instruction text shown above pre-assessment buttons */
    @Column(name = "pre_assessment_instructions", columnDefinition = "TEXT")
    private String preAssessmentInstructions;

    /** Days after enrollment to send a completion reminder (null = no reminder) */
    @Column(name = "reminder_days")
    private Integer reminderDays;

    // ── Content fields (mirrors Course entity) ──────────────────────────────

    @Column(name = "target_audience", columnDefinition = "TEXT")
    private String targetAudience;

    @Column(name = "assessment", columnDefinition = "TEXT")
    private String assessment;

    @Column(name = "outcome", columnDefinition = "TEXT")
    private String outcome;

    /** JSON array of strings: ["Detail 1", "Detail 2", ...] */
    @Column(name = "exam_details", columnDefinition = "TEXT")
    private String examDetails;

    // ────────────────────────────────────────────────────────────────────────

    @OneToMany(mappedBy = "flagshipProgram", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<FlagshipProgramPrice> countryPrices = new ArrayList<>();

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<FlagshipVideo> videos = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "flagship_program_course",
        joinColumns = @JoinColumn(name = "flagship_program_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    @Builder.Default
    private List<Course> courses = new ArrayList<>();

    /**
     * JSON array of section objects.
     * Example: [{"type":"overview","title":"...","items":[...]}, ...]
     */
    @Column(columnDefinition = "TEXT")
    private String sections;

    @Builder.Default
    private Boolean active = true;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "training_duration")
    private String trainingDuration;
}
