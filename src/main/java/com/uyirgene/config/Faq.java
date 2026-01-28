package com.uyirgene.config;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "faq")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category; // GENERAL, COURSES, PAYMENTS, CERTIFICATES, TECHNICAL

    @Column(nullable = false, length = 500)
    private String question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String answer;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // FAQ Categories
    public static final String CATEGORY_GENERAL = "GENERAL";
    public static final String CATEGORY_COURSES = "COURSES";
    public static final String CATEGORY_PAYMENTS = "PAYMENTS";
    public static final String CATEGORY_CERTIFICATES = "CERTIFICATES";
    public static final String CATEGORY_TECHNICAL = "TECHNICAL";

    public static String[] getAllCategories() {
        return new String[] {
            CATEGORY_GENERAL,
            CATEGORY_COURSES,
            CATEGORY_PAYMENTS,
            CATEGORY_CERTIFICATES,
            CATEGORY_TECHNICAL
        };
    }

    public static String getCategoryLabel(String category) {
        return switch (category) {
            case CATEGORY_GENERAL -> "General";
            case CATEGORY_COURSES -> "Courses";
            case CATEGORY_PAYMENTS -> "Payments & Refunds";
            case CATEGORY_CERTIFICATES -> "Certificates";
            case CATEGORY_TECHNICAL -> "Technical Support";
            default -> category;
        };
    }
}
