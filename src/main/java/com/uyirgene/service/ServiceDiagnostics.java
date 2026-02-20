package com.uyirgene.service;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_diagnostics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDiagnostics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "test_profiles", columnDefinition = "TEXT")
    private String testProfiles;

    @Column(columnDefinition = "TEXT")
    private String highlights;

    @Lob
    @Column(name = "thumbnail_image")
    private byte[] thumbnailImage;

    @Column(name = "thumbnail_image_content_type")
    private String thumbnailImageContentType;

    @Lob
    @Column(name = "hero_image")
    private byte[] heroImage;

    @Column(name = "hero_image_content_type")
    private String heroImageContentType;

    @Column(nullable = false)
    private Boolean published = false;

    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
