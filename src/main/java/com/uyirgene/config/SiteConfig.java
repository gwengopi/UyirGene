package com.uyirgene.config;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity for storing site-wide configuration like images, settings, etc.
 * Uses key-value pairs for flexibility.
 */
@Entity
@Table(name = "site_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_key", nullable = false, unique = true, length = 100)
    private String key;

    @Column(name = "config_value", columnDefinition = "TEXT")
    private String value;

    @Column(name = "config_type", length = 50)
    private String type; // IMAGE, TEXT, URL, JSON, etc.

    @Column(name = "category", length = 50)
    private String category; // HERO, LOGO, ABOUT, COURSE, etc.

    @Column(length = 255)
    private String description;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean active = true;

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
