package com.uyirgene.course;

import com.uyirgene.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "enrollment")
// Unique constraints replaced by partial indexes in V33 migration:
//   UNIQUE (user_id, course_id) WHERE course_id IS NOT NULL
//   UNIQUE (user_id, flagship_program_id) WHERE flagship_program_id IS NOT NULL
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Enrollment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne(optional = true)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(optional = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "flagship_program_id")
    private FlagshipProgram flagshipProgram;

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
    private String trainerName;

    // Bundle reference (if enrolled via bundle purchase)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bundle_id")
    private CourseBundle bundle;

    // Payment order ID for idempotency
    private String paymentOrderId;

    // Payment currency and amount (for multi-currency tracking)
    private String paymentCurrency;
    private Double paymentAmount;

    // Set when a completion reminder email has been sent — prevents duplicate sends
    private LocalDateTime reminderSentAt;

    // Set when the user unenrolls — null for active enrollments
    private LocalDateTime unenrolledAt;

    public enum Status {
        PENDING, ENROLLED, COMPLETED, UNENROLLED
    }

    public enum CertificateType {
        COMPLETION,    // Passed the test (marks >= pass mark)
        PARTICIPATION  // Did not pass but participated
    }

    public boolean canViewResults() {
        if (testCompletedAt == null) return false;
        return LocalDateTime.now().isAfter(testCompletedAt.plusHours(48));
    }

    public CertificateType determineCertificateType(double passMarkPercentage) {
        if (marks == null) return null;
        return marks >= passMarkPercentage ? CertificateType.COMPLETION : CertificateType.PARTICIPATION;
    }
}
