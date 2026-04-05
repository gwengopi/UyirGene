package com.uyirgene.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String HEX_CHARS = "0123456789abcdef";

    private String generateToken(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) sb.append(HEX_CHARS.charAt(RANDOM.nextInt(16)));
        return sb.toString();
    }

    public User register(String name, String email, String password, Role role) {
        if (repo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists");
        }
        User u = User.builder()
                .name(name)
                .email(email)
                .password(encoder.encode(password))
                .role(role)
                .authProvider("LOCAL")
                .enabled(true).build();
        return repo.save(u);
    }

    public User updateProfile(User user, String name, String currentPassword, String newPassword) {
        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }
        if (newPassword != null && !newPassword.isBlank()) {
            if (currentPassword == null || !encoder.matches(currentPassword, user.getPassword())) {
                throw new IllegalArgumentException("Current password is incorrect");
            }
            user.setPassword(encoder.encode(newPassword));
            // Password explicitly set — magic link access is no longer needed
            user.setMagicLinkToken(null);
            user.setMagicLinkTokenCreatedAt(null);
        }
        return repo.save(user);
    }

    /**
     * Finds an existing user by email, or creates a new guest account.
     * If the email already belongs to a registered user, returns that user unchanged
     * (they can log in normally; the enrollment will be attached to their account).
     */
    @Transactional
    public User findOrCreateGuestUser(String name, String email, String phone) {
        return repo.findByEmail(email.trim().toLowerCase()).orElseGet(() -> {
            // Random password — user cannot know this; access is via magic link until they set one
            String randomPassword = generateToken(32);
            User u = User.builder()
                    .name(name != null ? name.trim() : null)
                    .email(email.trim().toLowerCase())
                    .password(encoder.encode(randomPassword))
                    .phoneNumber(phone != null ? phone.trim() : null)
                    .role(Role.STUDENT)
                    .authProvider("LOCAL")
                    .enabled(true)
                    .build();
            return repo.save(u);
        });
    }

    /**
     * Generates a magic link token for the user and persists it.
     * Only generates a new token if one doesn't already exist (idempotent for concurrent requests).
     * Returns the token value.
     */
    @Transactional
    public String generateMagicLinkToken(User user) {
        if (user.getMagicLinkToken() != null) {
            return user.getMagicLinkToken();
        }
        String token = generateToken(64);
        user.setMagicLinkToken(token);
        user.setMagicLinkTokenCreatedAt(LocalDateTime.now());
        repo.save(user);
        return token;
    }

    /**
     * Validates a magic link token. Returns the user if valid, empty if expired or not found.
     * Token is valid for 30 days from creation.
     */
    public Optional<User> validateMagicLinkToken(String token) {
        return repo.findByMagicLinkToken(token).filter(u -> {
            if (u.getMagicLinkTokenCreatedAt() == null) return false;
            return u.getMagicLinkTokenCreatedAt().plusDays(30).isAfter(LocalDateTime.now());
        });
    }

    public User findOrCreateGoogleUser(String email, String name, String pictureUrl) {
        Optional<User> existing = repo.findByEmail(email);
        if (existing.isPresent()) {
            return existing.get();
        }

        User user = User.builder()
                .email(email)
                .name(name)
                .role(Role.STUDENT)
                .authProvider("GOOGLE")
                .profileImageUrl(pictureUrl)
                .enabled(true)
                .build();
        return repo.save(user);
    }
}
