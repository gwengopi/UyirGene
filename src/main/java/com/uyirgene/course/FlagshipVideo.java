package com.uyirgene.course;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "flagship_video")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FlagshipVideo {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "flagship_program_id")
    @JsonIgnore
    private FlagshipProgram program;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;
}
