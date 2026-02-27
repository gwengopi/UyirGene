package com.uyirgene.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String email;
    private String name;
    @JsonIgnore
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role;
    private boolean enabled = true;

    @Column(name = "auth_provider")
    @Builder.Default
    private String authProvider = "LOCAL";

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "marketing_opt_out")
    @Builder.Default
    private boolean marketingOptOut = false;

    @Column(name = "marketing_opt_out_token", length = 64)
    private String marketingOptOutToken;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
