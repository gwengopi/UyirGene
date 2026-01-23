package com.uyirgene.course;

import com.uyirgene.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Certificate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne(optional = false)
    private Course course;

    private LocalDateTime issuedAt;
    private String certificateId;
    private String filePath;

    // Certificate type: COMPLETION or PARTICIPATION
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CertificateType type = CertificateType.COMPLETION;

    // Marks achieved (stored for reference)
    private Double marks;

    public enum CertificateType {
        COMPLETION,    // Course completion certificate (passed)
        PARTICIPATION  // Participation certificate (did not pass)
    }
}