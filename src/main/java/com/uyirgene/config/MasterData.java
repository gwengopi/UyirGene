package com.uyirgene.config;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity for storing master data for dropdowns and other configurable lists.
 * Examples: Course categories, User roles display names, Status options, etc.
 */
@Entity
@Table(name = "master_data",
       uniqueConstraints = @UniqueConstraint(columnNames = {"data_type", "code"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_type", nullable = false, length = 50)
    private String dataType; // COURSE_CATEGORY, DURATION_TYPE, SKILL_LEVEL, etc.

    @Column(nullable = false, length = 100)
    private String code; // Internal code/value (e.g., "PROGRAMMING", "BEGINNER")

    @Column(nullable = false, length = 200)
    private String label; // Display label (e.g., "Programming", "Beginner Level")

    @Column(length = 500)
    private String description;

    @Column(name = "icon_url", length = 500)
    private String iconUrl; // Optional icon for the option

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean active = true;

    @Column(name = "parent_id")
    private Long parentId; // For hierarchical data (subcategories, etc.)

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON for additional properties

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
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
