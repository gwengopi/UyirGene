package com.uyirgene.course;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "marketing_mail_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketingMailLog {

    public enum Status {
        PENDING, SENT, FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private MarketingCampaign campaign;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String email;

    @Column(name = "batch_number", nullable = false)
    private int batchNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
