package com.uyirgene.service;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "careers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Career {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String subtitle;

    @Column(name = "why_join_title")
    private String whyJoinTitle;

    @Column(name = "why_join_description", columnDefinition = "TEXT")
    private String whyJoinDescription;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(columnDefinition = "TEXT")
    private String positions;

    @Column(nullable = false)
    private Boolean published = false;

    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
