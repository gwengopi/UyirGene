package com.uyirgene.service;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_certifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCertification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; // e.g., "ISO 22000 - Food Safety Certifications"

    private String subtitle; // e.g., "Global Training & Certification Services"

    @Column(columnDefinition = "TEXT")
    private String description; // Overview text

    @Column(columnDefinition = "TEXT")
    private String whatIs; // "What is ISO 22000?" description

    @Column(columnDefinition = "TEXT")
    private String keyElements; // JSON array: ["Interactive Communication", "HACCP Principles", ...]

    @Column(columnDefinition = "TEXT")
    private String whoNeeds; // JSON array: ["Food manufacturing", "Animal feed manufacturing", ...]

    @Column(columnDefinition = "TEXT")
    private String certificationRoute; // JSON array: [{"label": "Enquiry", "description": "..."}, ...]

    @Column(columnDefinition = "TEXT")
    private String benefits; // JSON array: ["Benefit 1", "Benefit 2", ...]

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] thumbnailImage;

    private String thumbnailImageContentType;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] heroImage;

    private String heroImageContentType;

    @Column(nullable = false)
    private Boolean published = false;

    private Integer displayOrder = 0;
}
