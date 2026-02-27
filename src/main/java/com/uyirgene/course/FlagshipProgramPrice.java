package com.uyirgene.course;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "flagship_program_price",
       uniqueConstraints = @UniqueConstraint(columnNames = {"flagship_program_id", "country_code"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FlagshipProgramPrice {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flagship_program_id", nullable = false)
    @JsonIgnore
    private FlagshipProgram flagshipProgram;

    @Column(name = "country_code", nullable = false, length = 10)
    private String countryCode;

    @Column(name = "currency_code", nullable = false, length = 10)
    private String currencyCode;

    @Column(nullable = false)
    private Double amount;
}
