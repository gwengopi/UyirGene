package com.uyirgene.course;

import com.uyirgene.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "course_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Enrollment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne(optional = false)
    private Course course;

    private LocalDateTime enrolledAt;

    @Enumerated(EnumType.STRING)
    private Status status;

    // Test/Assessment related fields
    private LocalDateTime testCompletedAt;
    private LocalDateTime resultPublishedAt;

    // Marks entered by admin (0-100 scale)
    private Double marks;

    // Certificate type based on marks
    @Enumerated(EnumType.STRING)
    private CertificateType certificateType;

    // Trainer name at the time of marks entry (for certificate)
    // Defaults to course trainer, can be overridden by admin
    private String trainerName;

    // Payment order ID for idempotency
    private String paymentOrderId;

    public enum Status {
        PENDING, ENROLLED, COMPLETED
    }

    public enum CertificateType {
        COMPLETION,    // Passed the test (marks >= pass mark)
        PARTICIPATION  // Did not pass but participated
    }

    /**
     * Check if test results can be viewed (48 hours after test completion)
     */
    public boolean canViewResults() {
        if (testCompletedAt == null) {
            return false;
        }
        // Results visible 48 hours after test completion
        return LocalDateTime.now().isAfter(testCompletedAt.plusHours(48));
    }

    /**
     * Determine certificate type based on marks and pass mark threshold
     */
    public CertificateType determineCertificateType(double passMarkPercentage) {
        if (marks == null) {
            return null;
        }
        return marks >= passMarkPercentage ? CertificateType.COMPLETION : CertificateType.PARTICIPATION;
    }
}