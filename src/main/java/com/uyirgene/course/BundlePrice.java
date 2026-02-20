package com.uyirgene.course;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bundle_price", uniqueConstraints = @UniqueConstraint(columnNames = {"bundle_id", "country_code"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BundlePrice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bundle_id", nullable = false)
    @JsonIgnore
    private CourseBundle bundle;

    @Column(name = "country_code", nullable = false, length = 3)
    private String countryCode;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode;

    @Column(nullable = false)
    private Double amount;
}
