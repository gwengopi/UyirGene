package com.uyirgene.course;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "course_bundle")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseBundle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bundle_code", unique = true, nullable = false, length = 50)
    private String bundleCode;

    @Column(nullable = false)
    private String title;

    @Column(unique = true, length = 200)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(name = "original_price")
    private Double originalPrice;

    @Builder.Default
    private Boolean published = false;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "thumbnail_image", columnDefinition = "BYTEA")
    private byte[] thumbnailImage;

    @Column(name = "thumbnail_image_content_type", length = 100)
    private String thumbnailImageContentType;

    @Column(length = 100)
    private String category;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "course_bundle_course",
        joinColumns = @JoinColumn(name = "bundle_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    @Builder.Default
    private List<Course> courses = new ArrayList<>();

    @OneToMany(mappedBy = "bundle", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<BundlePrice> countryPrices = new ArrayList<>();
}
