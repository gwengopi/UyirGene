package com.uyirgene.blog;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "blog_subscription")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BlogSubscription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    @Builder.Default
    private Boolean active = true;

    // Token for unsubscribe link
    @Column(unique = true)
    private String unsubscribeToken;

    private LocalDateTime subscribedAt;

    private LocalDateTime unsubscribedAt;

    @PrePersist
    public void prePersist() {
        this.subscribedAt = LocalDateTime.now();
        if (this.unsubscribeToken == null) {
            this.unsubscribeToken = java.util.UUID.randomUUID().toString();
        }
    }
}
