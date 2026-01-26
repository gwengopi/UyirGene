package com.uyirgene.blog;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Blog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Blog Title (H1) - Max 70 characters
    @Column(length = 70, nullable = false)
    private String title;

    // Short Description - Max 300 characters
    @Column(length = 300)
    private String shortDescription;

    // Blog Content - Full content with HTML formatting
    @Column(columnDefinition = "TEXT")
    private String content;

    // Author Name - Default "Editorial Team"
    @Column(length = 100)
    @Builder.Default
    private String authorName = "Editorial Team";

    // Category - Single category
    @Column(length = 50)
    private String category;

    // Tags - Comma-separated keywords (5-8)
    @Column(length = 500)
    private String tags;

    // Status: DRAFT, PUBLISHED, SCHEDULED, ARCHIVED
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private BlogStatus status = BlogStatus.DRAFT;

    // Publish Date - Set when status is PUBLISHED or SCHEDULED
    private LocalDateTime publishDate;

    // Created Date - Auto-generated
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Last Updated Date - Updated on every change
    private LocalDateTime updatedAt;

    // Visibility: PUBLIC, PRIVATE, MEMBERS_ONLY
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private BlogVisibility visibility = BlogVisibility.PUBLIC;

    // Language - Default English
    @Column(length = 10)
    @Builder.Default
    private String language = "en";

    // URL Slug - Lowercase, hyphen-separated, unique
    @Column(unique = true, length = 100)
    private String urlSlug;

    // Reading Time in minutes - Auto-calculated
    private Integer readingTimeMinutes;

    // Featured image stored as bytes
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BYTEA")
    private byte[] featuredImage;
    private String featuredImageContentType;

    // Legacy field for backward compatibility
    private String imageUrl;

    // View count for analytics
    @Builder.Default
    private Long viewCount = 0L;

    public enum BlogStatus {
        DRAFT, PUBLISHED, SCHEDULED, ARCHIVED
    }

    public enum BlogVisibility {
        PUBLIC, PRIVATE, MEMBERS_ONLY
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.urlSlug == null || this.urlSlug.isEmpty()) {
            this.urlSlug = generateSlug(this.title);
        }
        calculateReadingTime();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        calculateReadingTime();
    }

    private void calculateReadingTime() {
        if (this.content != null && !this.content.isEmpty()) {
            // Strip HTML tags and count words
            String plainText = this.content.replaceAll("<[^>]*>", " ");
            String[] words = plainText.trim().split("\\s+");
            // Assume 200 words per minute
            this.readingTimeMinutes = Math.max(1, (int) Math.ceil(words.length / 200.0));
        } else {
            this.readingTimeMinutes = 1;
        }
    }

    public static String generateSlug(String title) {
        if (title == null) return "";
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
