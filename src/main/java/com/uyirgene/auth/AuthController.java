package com.uyirgene.auth;

import com.uyirgene.user.Role;
import com.uyirgene.user.User;
import com.uyirgene.user.UserRepository;
import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.UserService;
import jakarta.validation.constraints.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User registered"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<User> register(@RequestBody RegisterRequest req) {
//        return ResponseEntity.ok(new User());
        User u = userService.register(req.getName(), req.getEmail(), req.getPassword(), req.getRole());
        return ResponseEntity.status(201).body(u);
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

    @Data
    static class RegisterRequest {
        @NotBlank private String name;
        @Email private String email;
        @NotBlank private String password;
        private Role role;
    }

    @PostMapping("/public/register")
    public String publicTest(@RequestBody RegisterRequest req) {
        User u = userService.register(req.getName(), req.getEmail(), req.getPassword(), req.getRole());
//        return ResponseEntity.status(201).body(u);
        return "ok";
    }

    @PostMapping("/public")
    public String publicTest() {
        return "ok";
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
