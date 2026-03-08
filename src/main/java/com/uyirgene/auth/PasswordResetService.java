package com.uyirgene.auth;

import com.uyirgene.course.MailService;
import com.uyirgene.user.User;
import com.uyirgene.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String HEX_CHARS = "0123456789abcdef";

    @Transactional
    public void generateAndSendToken(String email) {
        // Always succeed — don't leak whether the email exists
        userRepository.findByEmail(email).ifPresent(user -> {
            String token = generateToken();
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            mailService.sendPasswordReset(user, resetLink);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link"));
        if (user.getPasswordResetTokenExpiry() == null ||
                user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset link has expired. Please request a new one.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);
    }

    private String generateToken() {
        StringBuilder sb = new StringBuilder(64);
        for (int i = 0; i < 64; i++) {
            sb.append(HEX_CHARS.charAt(RANDOM.nextInt(16)));
        }
        return sb.toString();
    }
}
