package com.uyirgene.auth;

import com.uyirgene.user.Role;
import com.uyirgene.user.User;
import com.uyirgene.user.UserRepository;
import com.uyirgene.user.UserService;
import jakarta.validation.constraints.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        User u = userService.register(req.getName(), req.getEmail(), req.getPassword(), req.getRole());
        return ResponseEntity.ok(u);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR','STUDENT')")
    public ResponseEntity<?> me() {
        return ResponseEntity.ok("Authenticated user details placeholder");
    }

    @Data
    static class RegisterRequest {
        @NotBlank private String name;
        @Email private String email;
        @NotBlank private String password;
        private Role role;
    }
}
