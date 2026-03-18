package com.uyirgene.course;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Custom course identifier (e.g., "COURSE-001", "BIO-101")
    @Column(unique = true)
    private String courseCode;

    private String title;

    // Short marketing tagline shown below the title on the detail page
    @Column(length = 300)
    private String tagline;

    // Short description for certificate and previews
    @Column(length = 500)
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Structured description sections (all optional, stored as TEXT)
    @Column(columnDefinition = "TEXT")
    private String keyComponents;       // JSON: [{title, points[]}]
    @Column(columnDefinition = "TEXT")
    private String targetAudience;
    @Column(columnDefinition = "TEXT")
    private String assessment;
    @Column(columnDefinition = "TEXT")
    private String outcome;
    @Column(columnDefinition = "TEXT")
    private String courseDurationText;
    @Column(columnDefinition = "TEXT")
    private String examDetails;         // JSON: ["point1", "point2"]

    private String category;
    private Integer durationHours;
    private Double price;
    private Boolean published;

    @Builder.Default
    private Boolean flagship = false;

    // Display order for controlling course listing position (lower = shown first, null = last)
    private Integer displayOrder;

    // Course delivery mode: SELF_PACED, LIVE_ONLINE, CLASSROOM
    @Column(length = 50)
    private String courseType;

    // Course trainer/instructor name
    private String trainerName;

    // Thumbnail image - displayed in courses list (stored on filesystem)
    @Column(name = "thumbnail_image_path")
    private String thumbnailImagePath;
    private String thumbnailImageContentType;

    // Description image - displayed in course detail page (stored on filesystem)
    @Column(name = "description_image_path")
    private String descriptionImagePath;
    private String descriptionImageContentType;

    // Legacy image field - kept for backward compatibility (stored on filesystem)
    @Column(name = "image_path")
    private String imagePath;
    private String imageContentType;

    // Country-specific prices
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CoursePrice> countryPrices = new ArrayList<>();

    // Test/Assessment link (Google Form or external link)
    private String testLink;

    @Column(length = 500)
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

    // Days after enrollment to send a completion reminder (null = no reminder)
    private Integer reminderDays;
}
