package com.uyirgene.service;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_testings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceTesting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(unique = true, length = 200)
    private String slug;

    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "what_is", columnDefinition = "TEXT")
    private String whatIs;

    @Column(name = "why_matters", columnDefinition = "TEXT")
    private String whyMatters;

    @Column(columnDefinition = "TEXT")
    private String certificate;

    @Column(name = "testing_services", columnDefinition = "TEXT")
    private String testingServices;

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
