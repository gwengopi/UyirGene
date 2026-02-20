package com.uyirgene.config;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "google_review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(nullable = false)
    private Integer rating; // 1-5

    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText;

    @Column(name = "relative_time_description")
    private String relativeTimeDescription;

    @Column(name = "profile_photo_url", length = 1000)
    private String profilePhotoUrl;

    @Column(name = "publish_time")
    private Long publishTime; // Unix epoch seconds

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String source = "MANUAL"; // GOOGLE_API or MANUAL

    @Column(name = "is_active")
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
