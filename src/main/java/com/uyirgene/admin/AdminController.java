package com.uyirgene.admin;

import com.uyirgene.config.SiteConfigService;
import com.uyirgene.course.*;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificateService certificateService;
    private final CertificateRepository certificateRepository;
    private final SiteConfigService siteConfigService;
    private final MailService mailService;

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
                .map(this::mapToEnrollmentResponse)
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

    @PutMapping("/enrollments/{id}/marks")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user marks for an enrollment")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Marks updated"),
            @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<EnrollmentResponse> updateEnrollmentMarks(
            @PathVariable("id") Long enrollmentId,
            @RequestBody MarksUpdateRequest req
    ) {
        return enrollmentRepository.findById(enrollmentId)
                .map(enrollment -> {
                    boolean isFirstTimeMarks = enrollment.getTestCompletedAt() == null;
                    enrollment.setMarks(req.getMarks());

                    // Set trainer name - use provided name or default to course trainer
                    String trainerName = req.getTrainerName();
                    if (trainerName == null || trainerName.isBlank()) {
                        // Default to course trainer name if not provided
                        if (enrollment.getCourse() != null && enrollment.getCourse().getTrainerName() != null) {
                            trainerName = enrollment.getCourse().getTrainerName();
                        }
                    }
                    enrollment.setTrainerName(trainerName);

                    // Determine certificate type based on pass mark
                    double passMarkPercentage = getPassMarkPercentage();
                    String certTypeName = null;
                    if (req.getMarks() != null) {
                        Enrollment.CertificateType certType = req.getMarks() >= passMarkPercentage
                                ? Enrollment.CertificateType.COMPLETION
                                : Enrollment.CertificateType.PARTICIPATION;
                        enrollment.setCertificateType(certType);
                        certTypeName = certType.name();
                    }

                    // Mark test as completed
                    if (enrollment.getTestCompletedAt() == null) {
                        enrollment.setTestCompletedAt(LocalDateTime.now());
                    }

                    Enrollment saved = enrollmentRepository.save(enrollment);

                    // Send course completion email (only for first time marks submission)
                    if (isFirstTimeMarks) {
                        try {
                            User user = saved.getUser();
                            Course course = saved.getCourse();
                            if (user != null && course != null) {
                                mailService.sendCourseCompletion(user, course, req.getMarks(), certTypeName);
                            }
                        } catch (Exception e) {
                            // Log but don't fail the operation
                        }
                    }

                    return ResponseEntity.ok(mapToEnrollmentResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/enrollments/{id}/publish-result")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Publish test result for an enrollment (makes result visible to user)")
    @ApiResponse(responseCode = "200", description = "Result published")
    public ResponseEntity<EnrollmentResponse> publishResult(@PathVariable("id") Long enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .map(enrollment -> {
                    enrollment.setResultPublishedAt(LocalDateTime.now());
                    Enrollment saved = enrollmentRepository.save(enrollment);

                    // Send result published email notification
                    try {
                        User user = saved.getUser();
                        Course course = saved.getCourse();
                        if (user != null && course != null) {
                            mailService.sendResultPublished(user, course, saved);
                        }
                    } catch (Exception e) {
                        // Log but don't fail the operation
                    }

                    return ResponseEntity.ok(mapToEnrollmentResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/enrollments/{id}/generate-certificate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate certificate for an enrollment based on marks")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Certificate generated"),
            @ApiResponse(responseCode = "400", description = "Marks not entered or result not published"),
            @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<?> generateCertificate(@PathVariable("id") Long enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .map(enrollment -> {
                    // Validate marks are entered
                    if (enrollment.getMarks() == null) {
                        return ResponseEntity.badRequest().body("Marks must be entered before generating certificate");
                    }

                    // Determine certificate type
                    double passMarkPercentage = getPassMarkPercentage();
                    Certificate.CertificateType certType = enrollment.getMarks() >= passMarkPercentage
                            ? Certificate.CertificateType.COMPLETION
                            : Certificate.CertificateType.PARTICIPATION;

                    // Get trainer name from enrollment (set during marks entry) or fallback to course trainer
                    String trainerName = enrollment.getTrainerName();
                    if (trainerName == null || trainerName.isBlank()) {
                        trainerName = enrollment.getCourse() != null ? enrollment.getCourse().getTrainerName() : null;
                    }

                    // Generate certificate with trainer name
                    Certificate certificate = certificateService.generateCertificateWithType(
                            enrollment.getUser(),
                            enrollment.getCourse(),
                            certType,
                            enrollment.getMarks(),
                            trainerName
                    );

                    // Update enrollment
                    enrollment.setCertificateType(Enrollment.CertificateType.valueOf(certType.name()));
                    enrollment.setStatus(Enrollment.Status.COMPLETED);
                    enrollmentRepository.save(enrollment);

                    return ResponseEntity.ok(certificate);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private double getPassMarkPercentage() {
        String passMarkStr = siteConfigService.getConfigValue("PASS_MARK_PERCENTAGE", "60");
        try {
            return Double.parseDouble(passMarkStr);
        } catch (NumberFormatException e) {
            return 60.0;
        }
    }

    @GetMapping("/enrollments/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get a single enrollment with full details")
    public ResponseEntity<EnrollmentResponse> getEnrollment(@PathVariable("id") Long enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .map(e -> ResponseEntity.ok(mapToEnrollmentResponse(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    private EnrollmentResponse mapToEnrollmentResponse(Enrollment e) {
        // Check if certificate exists for this enrollment
        boolean hasCertificate = false;
        String certificateId = null;
        if (e.getUser() != null && e.getCourse() != null) {
            var cert = certificateRepository.findByUserAndCourse(e.getUser(), e.getCourse());
            if (cert.isPresent()) {
                hasCertificate = true;
                certificateId = cert.get().getCertificateId();
            }
        }

        // Check if course has a test link
        boolean hasTestLink = e.getCourse() != null && e.getCourse().getTestLink() != null
                && !e.getCourse().getTestLink().isEmpty();

        // Determine pass mark
        double passMarkPercentage = getPassMarkPercentage();

        // Get trainer name from enrollment or default to course trainer
        String trainerName = e.getTrainerName();
        String defaultTrainerName = e.getCourse() != null ? e.getCourse().getTrainerName() : null;

        return EnrollmentResponse.builder()
                .id(e.getId())
                .userId(e.getUser() != null ? e.getUser().getId() : null)
                .userName(e.getUser() != null ? e.getUser().getName() : "Unknown")
                .userEmail(e.getUser() != null ? e.getUser().getEmail() : "Unknown")
                .courseId(e.getCourse() != null ? e.getCourse().getId() : null)
                .courseName(e.getCourse() != null ? e.getCourse().getTitle() : "Unknown")
                .status(e.getStatus() != null ? e.getStatus().name() : "UNKNOWN")
                .coursePrice(e.getCourse() != null ? e.getCourse().getPrice() : null)
                .enrolledAt(e.getEnrolledAt() != null ? e.getEnrolledAt().toString() : null)
                .marks(e.getMarks())
                .passMarkPercentage(passMarkPercentage)
                .passed(e.getMarks() != null && e.getMarks() >= passMarkPercentage)
                .testCompletedAt(e.getTestCompletedAt() != null ? e.getTestCompletedAt().toString() : null)
                .resultPublishedAt(e.getResultPublishedAt() != null ? e.getResultPublishedAt().toString() : null)
                .certificateType(e.getCertificateType() != null ? e.getCertificateType().name() : null)
                .hasCertificate(hasCertificate)
                .certificateId(certificateId)
                .hasTestLink(hasTestLink)
                .testLink(e.getCourse() != null ? e.getCourse().getTestLink() : null)
                .testDescription(e.getCourse() != null ? e.getCourse().getTestDescription() : null)
                .canGenerateCertificate(e.getMarks() != null && !hasCertificate)
                .trainerName(trainerName)
                .defaultTrainerName(defaultTrainerName)
                .build();
    }

    @Data
    static class RoleUpdateRequest {
        private Role role;
    }

    @Data
    static class StatusUpdateRequest {
        private boolean enabled;
    }

    @Data
    static class MarksUpdateRequest {
        private Double marks;
        // Trainer name for certificate - defaults to course trainer if not provided
        private String trainerName;
    }

    // ========== Analytics Endpoints ==========

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get dashboard analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {
        long totalUsers = userRepository.count();
        long totalCourses = courseRepository.count();

        // Get all enrollments
        List<Enrollment> allEnrollments = enrollmentRepository.findAll();

        // Count only confirmed enrollments (ENROLLED or COMPLETED, not PENDING)
        long confirmedEnrollments = allEnrollments.stream()
                .filter(e -> e.getStatus() == Enrollment.Status.ENROLLED ||
                             e.getStatus() == Enrollment.Status.COMPLETED)
                .count();

        long completedEnrollments = allEnrollments.stream()
                .filter(e -> e.getStatus() == Enrollment.Status.COMPLETED)
                .count();

        // Calculate total revenue from paid enrollments (only ENROLLED or COMPLETED)
        double totalRevenue = allEnrollments.stream()
                .filter(e -> e.getCourse() != null &&
                             e.getCourse().getPrice() != null &&
                             e.getCourse().getPrice() > 0 &&
                             (e.getStatus() == Enrollment.Status.ENROLLED ||
                              e.getStatus() == Enrollment.Status.COMPLETED))
                .mapToDouble(e -> e.getCourse().getPrice())
                .sum();

        // Get recent enrollments (last 10, only confirmed)
        List<RecentEnrollment> recentEnrollments = allEnrollments.stream()
                .filter(e -> e.getStatus() == Enrollment.Status.ENROLLED ||
                             e.getStatus() == Enrollment.Status.COMPLETED)
                .sorted((a, b) -> {
                    if (a.getEnrolledAt() == null) return 1;
                    if (b.getEnrolledAt() == null) return -1;
                    return b.getEnrolledAt().compareTo(a.getEnrolledAt());
                })
                .limit(10)
                .map(e -> RecentEnrollment.builder()
                        .id(e.getId())
                        .userName(e.getUser() != null ? e.getUser().getName() : "Unknown")
                        .userEmail(e.getUser() != null ? e.getUser().getEmail() : "Unknown")
                        .courseName(e.getCourse() != null ? e.getCourse().getTitle() : "Unknown")
                        .coursePrice(e.getCourse() != null ? e.getCourse().getPrice() : null)
                        .status(e.getStatus() != null ? e.getStatus().name() : "UNKNOWN")
                        .enrolledAt(e.getEnrolledAt() != null ? e.getEnrolledAt().toString() : null)
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(AnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .totalCourses(totalCourses)
                .totalEnrollments(confirmedEnrollments)
                .completedEnrollments(completedEnrollments)
                .pendingEnrollments(allEnrollments.size() - confirmedEnrollments)
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
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @Data
    @Builder
    @AllArgsConstructor
    static class AnalyticsResponse {
        private long totalUsers;
        private long totalCourses;
        private long totalEnrollments;      // Confirmed enrollments (ENROLLED + COMPLETED)
        private long completedEnrollments;   // Only COMPLETED
        private long pendingEnrollments;     // Only PENDING
        private double totalRevenue;
        private List<RecentEnrollment> recentEnrollments;
    }

    @Data
    @Builder
    @AllArgsConstructor
    static class RecentEnrollment {
        private Long id;
        private String userName;
        private String userEmail;
        private String courseName;
        private Double coursePrice;
        private String status;
        private String enrolledAt;
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
        private Double marks;
        private Double passMarkPercentage;
        private Boolean passed;
        private String testCompletedAt;
        private String resultPublishedAt;
        private String certificateType;
        private Boolean hasCertificate;
        private String certificateId;
        private Boolean hasTestLink;
        private String testLink;
        private String testDescription;
        private Boolean canGenerateCertificate;
        // Trainer name for certificate (from enrollment, defaults to course trainer)
        private String trainerName;
        // Default trainer name from course (for UI to show as default)
        private String defaultTrainerName;
    }
}
