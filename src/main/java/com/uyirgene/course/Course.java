package com.uyirgene.course;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;
    private Integer durationHours;
    private Double price;
    private Boolean published;

    // Thumbnail image - displayed in courses list
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BYTEA")
    private byte[] thumbnailImage;
    private String thumbnailImageContentType;

    // Description image - displayed in course detail page
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BYTEA")
    private byte[] descriptionImage;
    private String descriptionImageContentType;

    // Legacy image field - kept for backward compatibility, maps to thumbnailImage
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BYTEA")
    private byte[] image;
    private String imageContentType;

    // Test/Assessment link (Google Form or external link)
    private String testLink;

    @Column(length = 500)
    private String testDescription;
}
