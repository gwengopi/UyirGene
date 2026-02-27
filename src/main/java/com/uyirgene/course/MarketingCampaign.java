package com.uyirgene.course;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "marketing_campaign")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketingCampaign {

    public enum Status {
        PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 500)
    private String subject;

    /** Stored with [[CTA:CODE|Label]] placeholders already resolved to button HTML at trigger time. */
    @Column(name = "html_body", nullable = false, columnDefinition = "TEXT")
    private String htmlBody;

    @Column(name = "total_recipients")
    @Builder.Default
    private int totalRecipients = 0;

    @Column(name = "total_batches")
    @Builder.Default
    private int totalBatches = 0;

    @Column(name = "batches_sent")
    @Builder.Default
    private int batchesSent = 0;

    @Column(name = "batch_size")
    @Builder.Default
    private int batchSize = 500;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "triggered_by")
    private String triggeredBy;

    @Column(name = "triggered_at")
    private LocalDateTime triggeredAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (triggeredAt == null) triggeredAt = LocalDateTime.now();
    }
}
