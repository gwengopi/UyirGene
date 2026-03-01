package com.uyirgene.course;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "manual_document")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManualDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    @JsonIgnore
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flagship_program_id")
    @JsonIgnore
    private FlagshipProgram flagshipProgram;

    @Column(nullable = false, length = 200)
    private String label;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_data", columnDefinition = "BYTEA")
    @JsonIgnore
    private byte[] fileData;

    @Column(name = "display_order")
    private int displayOrder;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
