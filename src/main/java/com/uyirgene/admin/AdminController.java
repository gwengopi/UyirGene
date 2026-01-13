package com.uyirgene.admin;

import com.uyirgene.course.CourseRepository;
import com.uyirgene.course.Enrollment;
import com.uyirgene.course.EnrollmentRepository;
import com.uyirgene.user.Role;
import com.uyirgene.user.User;
import com.uyirgene.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "List all users")
    @ApiResponse(responseCode = "200", description = "List of users")
    public ResponseEntity<List<User>> listUsers() {
        List<User> users = userRepository.findAll();
        // Clear passwords before returning
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<User> getUser(@PathVariable("id") Long id) {
        return userRepository.findById(id)
                .map(u -> {
                    u.setPassword(null);
                    return ResponseEntity.ok(u);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Role updated"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<User> updateUserRole(@PathVariable("id") Long id, @RequestBody RoleUpdateRequest req) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setRole(req.getRole());
                    User saved = userRepository.save(user);
                    saved.setPassword(null);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a user and all their enrollments")
    @ApiResponse(responseCode = "204", description = "User deleted")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        if (userRepository.existsById(id)) {
            // Delete all enrollments for this user first
            enrollmentRepository.deleteByUserId(id);
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle user enabled/disabled status")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<User> updateUserStatus(@PathVariable("id") Long id, @RequestBody StatusUpdateRequest req) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setEnabled(req.isEnabled());
                    User saved = userRepository.save(user);
                    saved.setPassword(null);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/{id}/enrollments")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get enrollments for a specific user")
    public ResponseEntity<List<EnrollmentResponse>> getUserEnrollments(@PathVariable("id") Long userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);
        List<EnrollmentResponse> response = enrollments.stream()
                .map(e -> EnrollmentResponse.builder()
                        .id(e.getId())
                        .userId(e.getUser() != null ? e.getUser().getId() : null)
                        .userName(e.getUser() != null ? e.getUser().getName() : "Unknown")
                        .userEmail(e.getUser() != null ? e.getUser().getEmail() : "Unknown")
                        .courseId(e.getCourse() != null ? e.getCourse().getId() : null)
                        .courseName(e.getCourse() != null ? e.getCourse().getTitle() : "Unknown")
                        .status(e.getStatus() != null ? e.getStatus().name() : "UNKNOWN")
                        .coursePrice(e.getCourse() != null ? e.getCourse().getPrice() : null)
                        .enrolledAt(e.getEnrolledAt() != null ? e.getEnrolledAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/enrollments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin unenroll - delete an enrollment")
    @ApiResponse(responseCode = "204", description = "Enrollment deleted")
    public ResponseEntity<?> adminUnenroll(@PathVariable("id") Long enrollmentId) {
        if (enrollmentRepository.existsById(enrollmentId)) {
            enrollmentRepository.deleteById(enrollmentId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/enrollments/{id}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin mark enrollment as completed")
    @ApiResponse(responseCode = "200", description = "Enrollment marked complete")
    public ResponseEntity<?> adminCompleteEnrollment(@PathVariable("id") Long enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .map(enrollment -> {
                    enrollment.setStatus(Enrollment.Status.COMPLETED);
                    enrollmentRepository.save(enrollment);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Data
    static class RoleUpdateRequest {
        private Role role;
    }

    @Data
    static class StatusUpdateRequest {
        private boolean enabled;
    }

    // ========== Analytics Endpoints ==========

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get dashboard analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {
        long totalUsers = userRepository.count();
        long totalCourses = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();

        // Get all enrollments
        List<Enrollment> allEnrollments = enrollmentRepository.findAll();

        // Calculate total revenue from courses (sum of course prices for enrolled students)
        double totalRevenue = allEnrollments.stream()
                .filter(e -> e.getCourse() != null && e.getCourse().getPrice() != null)
                .mapToDouble(e -> e.getCourse().getPrice())
                .sum();

        // Get recent enrollments (last 10)
        List<RecentEnrollment> recentEnrollments = allEnrollments.stream()
                .sorted((a, b) -> {
                    if (a.getEnrolledAt() == null) return 1;
                    if (b.getEnrolledAt() == null) return -1;
                    return b.getEnrolledAt().compareTo(a.getEnrolledAt());
                })
                .limit(10)
                .map(e -> RecentEnrollment.builder()
                        .userName(e.getUser() != null ? e.getUser().getName() : "Unknown")
                        .courseName(e.getCourse() != null ? e.getCourse().getTitle() : "Unknown")
                        .status(e.getStatus() != null ? e.getStatus().name() : "UNKNOWN")
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(AnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .totalCourses(totalCourses)
                .totalEnrollments(totalEnrollments)
                .totalRevenue(totalRevenue)
                .recentEnrollments(recentEnrollments)
                .build());
    }

    @GetMapping("/enrollments")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get all enrollments")
    public ResponseEntity<List<EnrollmentResponse>> getAllEnrollments() {
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        List<EnrollmentResponse> response = enrollments.stream()
                .map(e -> EnrollmentResponse.builder()
                        .id(e.getId())
                        .userId(e.getUser() != null ? e.getUser().getId() : null)
                        .userName(e.getUser() != null ? e.getUser().getName() : "Unknown")
                        .userEmail(e.getUser() != null ? e.getUser().getEmail() : "Unknown")
                        .courseId(e.getCourse() != null ? e.getCourse().getId() : null)
                        .courseName(e.getCourse() != null ? e.getCourse().getTitle() : "Unknown")
                        .status(e.getStatus() != null ? e.getStatus().name() : "UNKNOWN")
                        .coursePrice(e.getCourse() != null ? e.getCourse().getPrice() : null)
                        .enrolledAt(e.getEnrolledAt() != null ? e.getEnrolledAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @Data
    @Builder
    @AllArgsConstructor
    static class AnalyticsResponse {
        private long totalUsers;
        private long totalCourses;
        private long totalEnrollments;
        private double totalRevenue;
        private List<RecentEnrollment> recentEnrollments;
    }

    @Data
    @Builder
    @AllArgsConstructor
    static class RecentEnrollment {
        private String userName;
        private String courseName;
        private String status;
    }

    @Data
    @Builder
    @AllArgsConstructor
    static class EnrollmentResponse {
        private Long id;
        private Long userId;
        private String userName;
        private String userEmail;
        private Long courseId;
        private String courseName;
        private String status;
        private Double coursePrice;
        private String enrolledAt;
    }
}
