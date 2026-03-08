package com.uyirgene.auth;

import com.uyirgene.user.Role;
import com.uyirgene.user.User;
import com.uyirgene.user.UserRepository;
import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.UserService;
import com.uyirgene.security.JwtService;
import jakarta.validation.constraints.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User registered"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.getPassword() == null || req.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters"));
        }
        if (!req.getPassword().matches(".*[A-Z].*") || !req.getPassword().matches(".*[a-z].*") || !req.getPassword().matches(".*[0-9].*")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must contain at least one uppercase letter, one lowercase letter, and one number"));
        }
        User u = userService.register(req.getName(), req.getEmail(), req.getPassword(), req.getRole());
        return ResponseEntity.status(201).body(Map.of(
                "id", u.getId(),
                "email", u.getEmail(),
                "name", u.getName() != null ? u.getName() : "",
                "role", u.getRole().name()
        ));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password, returns JWT token")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
            User user = userRepository.findByEmail(req.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            String jwt = jwtService.generateToken(user);
            return ResponseEntity.ok(Map.of(
                    "token", "Bearer " + jwt,
                    "user", Map.of(
                            "id", user.getId(),
                            "email", user.getEmail(),
                            "name", user.getName() != null ? user.getName() : "",
                            "role", user.getRole().name()
                    )
            ));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR','STUDENT')")
    @Operation(summary = "Get current authenticated user")
    @ApiResponse(responseCode = "200", description = "Current user info")
    public ResponseEntity<?> me() {
        User u = currentUserService.getCurrentUser();
        // avoid exposing password
        MeResponse dto = new MeResponse(u.getId(), u.getEmail(), u.getName(), u.getRole());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR','STUDENT')")
    @Operation(summary = "Update current user profile")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile updated"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest req) {
        try {
            User u = currentUserService.getCurrentUser();
            // Validate new password if provided
            if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
                if (req.getNewPassword().length() < 8) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters"));
                }
                if (!req.getNewPassword().matches(".*[A-Z].*") || !req.getNewPassword().matches(".*[a-z].*") || !req.getNewPassword().matches(".*[0-9].*")) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Password must contain at least one uppercase letter, one lowercase letter, and one number"));
                }
            }
            User updated = userService.updateProfile(u, req.getName(), req.getCurrentPassword(), req.getNewPassword());
            return ResponseEntity.ok(new MeResponse(updated.getId(), updated.getEmail(), updated.getName(), updated.getRole()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        passwordResetService.generateAndSendToken(email.trim().toLowerCase());
        return ResponseEntity.ok(Map.of("message", "If an account exists with this email, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token and new password are required"));
        }
        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters"));
        }
        if (!newPassword.matches(".*[A-Z].*") || !newPassword.matches(".*[a-z].*") || !newPassword.matches(".*[0-9].*")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must contain uppercase, lowercase, and a number"));
        }
        try {
            passwordResetService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully. Please log in."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Data
    static class UpdateProfileRequest {
        private String name;
        private String currentPassword;
        private String newPassword;
    }

    @Data
    static class RegisterRequest {
        @NotBlank private String name;
        @Email private String email;
        @NotBlank private String password;
        private Role role;
    }

    @Data
    static class LoginRequest {
        @Email private String email;
        @NotBlank private String password;
    }

    @Data
    static class MeResponse {
        private Long id;
        private String email;
        private String name;
        private Role role;

        public MeResponse(Long id, String email, String name, Role role) {
            this.id = id;
            this.email = email;
            this.name = name;
            this.role = role;
        }
    }

}
