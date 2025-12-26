package com.uyirgene.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
                .enabled(true).build();
        return repo.save(u);
    }
}
