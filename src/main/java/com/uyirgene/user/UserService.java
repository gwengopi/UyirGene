package com.uyirgene.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public User register(String name, String email, String password, Role role) {
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
        }
        return repo.save(user);
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
