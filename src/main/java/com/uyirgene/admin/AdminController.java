package com.uyirgene.admin;

import com.uyirgene.config.SiteConfigService;
import com.uyirgene.course.*;
import com.uyirgene.user.Role;
import com.uyirgene.user.User;
import com.uyirgene.user.UserRepository;
import com.uyirgene.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificateService certificateService;
    private final CertificateRepository certificateRepository;
    private final SiteConfigService siteConfigService;
    private final MailService mailService;
    private final com.uyirgene.course.CourseReminderScheduler courseReminderScheduler;
    private final EnrollmentService enrollmentService;
    private final CourseBundleService courseBundleService;
    private final FlagshipProgramRepository flagshipProgramRepository;
    private final CourseBundleRepository courseBundleRepository;
    private final VideoProgressRepository videoProgressRepository;
    private final MarketingMailLogRepository marketingMailLogRepository;

    @Value("${app.certificate.folder:uploads/certificates}")
    private String certFolder;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all users")
    @ApiResponse(responseCode = "200", description = "List of users")
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<User> getUser(@PathVariable("id") Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
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
        return userRepository.findById(id).map(user -> {
            videoProgressRepository.deleteByUser(user);
            marketingMailLogRepository.deleteByUserId(id);
            certificateRepository.deleteByUser(user);
            enrollmentRepository.deleteByUserId(id);
            userRepository.delete(user);
            return ResponseEntity.noContent().build();
        }).orElse(ResponseEntity.notFound().build());
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
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/{id}/enrollments")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get enrollments for a specific user")
    public ResponseEntity<List<EnrollmentResponse>> getUserEnrollments(@PathVariable("id") Long userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId).stream()
                .filter(e -> e.getStatus() != Enrollment.Status.PENDING)
                .sorted(java.util.Comparator.comparing(
                        e -> e.getStatus() == Enrollment.Status.UNENROLLED ? 1 : 0))
                .collect(Collectors.toList());
        List<EnrollmentResponse> response = enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/enrollments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin unenroll - soft-delete an enrollment (sets status to UNENROLLED)")
    @ApiResponse(responseCode = "204", description = "Enrollment unenrolled")
    @Transactional
    public ResponseEntity<?> adminUnenroll(@PathVariable("id") Long enrollmentId) {
        return enrollmentRepository.findById(enrollmentId).map(e -> {
            if (e.getStatus() == Enrollment.Status.UNENROLLED) {
                return ResponseEntity.noContent().build(); // idempotent
            }
            e.setStatus(Enrollment.Status.UNENROLLED);
            e.setUnenrolledAt(java.time.LocalDateTime.now());
            enrollmentRepository.save(e);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
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

                    // When marks change the existing PDF is outdated — delete the file but KEEP the
                    // cert entity so its certificate_id is preserved for the next regeneration.
                    if (enrollment.getUser() != null) {
                        Optional<Certificate> existingCertOpt;
                        if (enrollment.getFlagshipProgram() != null) {
                            existingCertOpt = certificateRepository.findByUserAndFlagshipProgram(
                                    enrollment.getUser(), enrollment.getFlagshipProgram());
                        } else if (enrollment.getCourse() != null) {
                            existingCertOpt = certificateRepository.findByUserAndCourse(
                                    enrollment.getUser(), enrollment.getCourse());
                        } else {
                            existingCertOpt = Optional.empty();
                        }
                        if (existingCertOpt.isPresent()) {
                            Certificate existingCert = existingCertOpt.get();
                            if (existingCert.getFilePath() != null) {
                                try {
                                    java.nio.file.Files.deleteIfExists(java.nio.file.Path.of(existingCert.getFilePath()));
                                } catch (Exception ignored) {}
                                existingCert.setFilePath(null);
                                certificateRepository.save(existingCert);
                            }
                        }
                    }

                    enrollment.setMarks(req.getMarks());

                    // Set trainer name - use provided name or default to program/course trainer
                    String trainerName = req.getTrainerName();
                    if (trainerName == null || trainerName.isBlank()) {
                        if (enrollment.getFlagshipProgram() != null && enrollment.getFlagshipProgram().getTrainerName() != null) {
                            trainerName = enrollment.getFlagshipProgram().getTrainerName();
                        } else if (enrollment.getCourse() != null && enrollment.getCourse().getTrainerName() != null) {
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
                            if (user != null) {
                                if (saved.getFlagshipProgram() != null) {
                                    mailService.sendCourseCompletion(user, saved.getFlagshipProgram(), req.getMarks(), certTypeName);
                                } else if (saved.getCourse() != null) {
                                    mailService.sendCourseCompletion(user, saved.getCourse(), req.getMarks(), certTypeName);
                                }
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

                    // Send combined results + certificate email notification
                    try {
                        User user = saved.getUser();
                        if (user != null) {
                            if (saved.getFlagshipProgram() != null) {
                                Certificate certificate = certificateRepository.findByUserAndFlagshipProgram(user, saved.getFlagshipProgram()).orElse(null);
                                mailService.sendResultPublished(user, saved.getFlagshipProgram(), saved, certificate);
                            } else if (saved.getCourse() != null) {
                                Certificate certificate = certificateRepository.findByUserAndCourse(user, saved.getCourse()).orElse(null);
                                mailService.sendResultPublished(user, saved.getCourse(), saved, certificate);
                            }
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
    @Transactional
    @Operation(summary = "Generate certificate for an enrollment based on marks")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Certificate generated"),
            @ApiResponse(responseCode = "400", description = "Marks not entered or result not published"),
            @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<?> generateCertificate(@PathVariable("id") Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId).orElse(null);
        if (enrollment == null) {
            return ResponseEntity.notFound().build();
        }

        // Validate marks are entered
        if (enrollment.getMarks() == null) {
            return ResponseEntity.badRequest().body("Marks must be entered before generating certificate");
        }

        // Determine certificate type
        double passMarkPercentage = getPassMarkPercentage();
        Certificate.CertificateType certType = enrollment.getMarks() >= passMarkPercentage
                ? Certificate.CertificateType.COMPLETION
                : Certificate.CertificateType.PARTICIPATION;

        // Get trainer name from enrollment (set during marks entry) or fallback to program/course trainer
        String trainerName = enrollment.getTrainerName();
        if (trainerName == null || trainerName.isBlank()) {
            if (enrollment.getFlagshipProgram() != null) {
                trainerName = enrollment.getFlagshipProgram().getTrainerName();
            } else if (enrollment.getCourse() != null) {
                trainerName = enrollment.getCourse().getTrainerName();
            }
        }

        try {
            // Generate certificate — flagship or course path
            Certificate certificate;
            if (enrollment.getFlagshipProgram() != null) {
                certificate = certificateService.generateCertificateForFlagship(
                        enrollment.getUser(),
                        enrollment.getFlagshipProgram(),
                        certType,
                        enrollment.getMarks(),
                        trainerName
                );
            } else {
                certificate = certificateService.generateCertificateWithType(
                        enrollment.getUser(),
                        enrollment.getCourse(),
                        certType,
                        enrollment.getMarks(),
                        trainerName
                );
            }

            // Update enrollment
            enrollment.setCertificateType(Enrollment.CertificateType.valueOf(certType.name()));
            enrollment.setStatus(Enrollment.Status.COMPLETED);
            enrollmentRepository.save(enrollment);

            return ResponseEntity.ok(Map.of(
                    "certificateId", certificate.getCertificateId(),
                    "filePath", certificate.getFilePath() != null ? certificate.getFilePath() : "",
                    "type", certificate.getType().name()
            ));
        } catch (Exception e) {
            // Log the full stack trace so we can diagnose the root cause
            org.slf4j.LoggerFactory.getLogger(AdminController.class)
                    .error("Failed to generate certificate for enrollment {}: {}", enrollmentId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Certificate generation failed: " + e.getMessage()));
        }
    }

    @GetMapping("/enrollments/{id}/certificate/download")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Download/preview certificate PDF for an enrollment (admin only)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PDF certificate returned"),
            @ApiResponse(responseCode = "404", description = "Certificate not found")
    })
    public ResponseEntity<?> downloadCertificate(@PathVariable("id") Long enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .map(enrollment -> {
                    if (enrollment.getUser() == null) {
                        return ResponseEntity.notFound().build();
                    }

                    Optional<Certificate> certOpt;
                    if (enrollment.getFlagshipProgram() != null) {
                        certOpt = certificateRepository.findByUserAndFlagshipProgram(
                                enrollment.getUser(), enrollment.getFlagshipProgram());
                    } else if (enrollment.getCourse() != null) {
                        certOpt = certificateRepository.findByUserAndCourse(
                                enrollment.getUser(), enrollment.getCourse());
                    } else {
                        return ResponseEntity.notFound().build();
                    }

                    if (certOpt.isEmpty()) {
                        return ResponseEntity.status(404)
                                .body((Object) Map.of("error", "Certificate not found for this enrollment"));
                    }

                    Certificate cert = certOpt.get();
                    if (cert.getFilePath() == null) {
                        return ResponseEntity.status(404)
                                .body((Object) Map.of("error", "Certificate PDF has not been generated yet"));
                    }
                    java.io.File file = new java.io.File(cert.getFilePath());

                    // Path traversal prevention
                    try {
                        java.nio.file.Path certDir = java.nio.file.Path.of(certFolder).toAbsolutePath().normalize();
                        java.nio.file.Path filePath = file.toPath().toAbsolutePath().normalize();
                        if (!filePath.startsWith(certDir)) {
                            return ResponseEntity.status(403)
                                    .body((Object) Map.of("error", "Access denied"));
                        }
                    } catch (Exception ex) {
                        return ResponseEntity.status(500)
                                .body((Object) Map.of("error", "Certificate path validation failed"));
                    }

                    if (!file.exists()) {
                        return ResponseEntity.status(404)
                                .body((Object) Map.of("error", "Certificate file not found on disk"));
                    }

                    FileSystemResource fs = new FileSystemResource(file);
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION,
                                    "inline; filename=certificate-" + cert.getCertificateId() + ".pdf")
                            .contentType(MediaType.APPLICATION_PDF)
                            .body((Object) fs);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/enrollments/{id}/certificate/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Operation(summary = "Manually upload a certificate PDF for an enrollment")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Certificate uploaded"),
            @ApiResponse(responseCode = "400", description = "Invalid file or result already published"),
            @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<?> uploadCertificate(
            @PathVariable("id") Long enrollmentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files are accepted"));
        }

        // Validate PDF magic bytes to prevent content-type spoofing
        try {
            byte[] header = new byte[5];
            if (file.getInputStream().read(header) < 5 || !new String(header).startsWith("%PDF")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid PDF file"));
            }
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Could not read file"));
        }

        return enrollmentRepository.findById(enrollmentId)
                .map(enrollment -> {
                    boolean isFlagshipUpload = enrollment.getFlagshipProgram() != null;
                    if (enrollment.getUser() == null || (!isFlagshipUpload && enrollment.getCourse() == null)) {
                        return ResponseEntity.badRequest()
                                .body((Object) Map.of("error", "Invalid enrollment"));
                    }

                    try {
                        // Delete existing certificate if present
                        Optional<Certificate> existingCert;
                        if (isFlagshipUpload) {
                            existingCert = certificateRepository.findByUserAndFlagshipProgram(
                                    enrollment.getUser(), enrollment.getFlagshipProgram());
                        } else {
                            existingCert = certificateRepository.findByUserAndCourse(
                                    enrollment.getUser(), enrollment.getCourse());
                        }
                        if (existingCert.isPresent()) {
                            try {
                                java.io.File oldFile = new java.io.File(existingCert.get().getFilePath());
                                if (oldFile.exists()) oldFile.delete();
                            } catch (Exception ignored) {}
                            certificateRepository.delete(existingCert.get());
                            certificateRepository.flush();
                        }

                        // Generate certificate ID and save file to disk using Path (works reliably on Windows)
                        String certId = "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                        java.nio.file.Path dir = java.nio.file.Path.of(certFolder);
                        java.nio.file.Files.createDirectories(dir);
                        java.nio.file.Path targetPath = dir.resolve(certId + ".pdf");
                        file.transferTo(targetPath.toFile().getAbsoluteFile());
                        String filePath = targetPath.toString();

                        // Use admin-selected certificate type
                        Certificate.CertificateType certType;
                        try {
                            certType = Certificate.CertificateType.valueOf(type);
                        } catch (IllegalArgumentException e2) {
                            certType = Certificate.CertificateType.COMPLETION;
                        }

                        // Get trainer name
                        String trainerName = enrollment.getTrainerName();
                        if (trainerName == null || trainerName.isBlank()) {
                            if (isFlagshipUpload && enrollment.getFlagshipProgram() != null) {
                                trainerName = enrollment.getFlagshipProgram().getTrainerName();
                            } else if (enrollment.getCourse() != null) {
                                trainerName = enrollment.getCourse().getTrainerName();
                            }
                        }

                        // Create certificate record
                        Certificate.CertificateBuilder certBuilder = Certificate.builder()
                                .user(enrollment.getUser())
                                .certificateId(certId)
                                .filePath(filePath)
                                .issuedAt(LocalDateTime.now())
                                .type(certType)
                                .marks(enrollment.getMarks())
                                .trainerName(trainerName);
                        if (isFlagshipUpload) {
                            certBuilder.flagshipProgram(enrollment.getFlagshipProgram());
                        } else {
                            certBuilder.course(enrollment.getCourse());
                        }
                        certificateRepository.save(certBuilder.build());

                        // Update enrollment
                        enrollment.setCertificateType(Enrollment.CertificateType.valueOf(certType.name()));
                        enrollment.setStatus(Enrollment.Status.COMPLETED);
                        Enrollment saved = enrollmentRepository.save(enrollment);

                        return ResponseEntity.ok((Object) mapToEnrollmentResponse(saved));
                    } catch (Exception e) {
                        return ResponseEntity.status(500)
                                .body((Object) Map.of("error", "Failed to upload certificate"));
                    }
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
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get a single enrollment with full details")
    public ResponseEntity<EnrollmentResponse> getEnrollment(@PathVariable("id") Long enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .map(e -> ResponseEntity.ok(mapToEnrollmentResponse(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    private EnrollmentResponse mapToEnrollmentResponse(Enrollment e) {
        boolean isFlagship = e.getFlagshipProgram() != null;

        // Check if certificate exists for this enrollment
        boolean hasCertificate = false;
        String certificateId = null;
        if (e.getUser() != null) {
            Optional<Certificate> certOpt;
            if (isFlagship) {
                certOpt = certificateRepository.findByUserAndFlagshipProgram(e.getUser(), e.getFlagshipProgram());
            } else if (e.getCourse() != null) {
                certOpt = certificateRepository.findByUserAndCourse(e.getUser(), e.getCourse());
            } else {
                certOpt = Optional.empty();
            }
            if (certOpt.isPresent() && certOpt.get().getFilePath() != null) {
                hasCertificate = true;
                certificateId = certOpt.get().getCertificateId();
            }
        }

        // Resolve test link / description
        boolean hasTestLink;
        String testLink;
        String testDescription;
        if (isFlagship) {
            FlagshipProgram fp = e.getFlagshipProgram();
            hasTestLink = fp.getTestLink() != null && !fp.getTestLink().isEmpty();
            testLink = fp.getTestLink();
            testDescription = fp.getTestDescription();
        } else {
            hasTestLink = e.getCourse() != null && e.getCourse().getTestLink() != null
                    && !e.getCourse().getTestLink().isEmpty();
            testLink = e.getCourse() != null ? e.getCourse().getTestLink() : null;
            testDescription = e.getCourse() != null ? e.getCourse().getTestDescription() : null;
        }

        double passMarkPercentage = getPassMarkPercentage();

        String trainerName = e.getTrainerName();
        String defaultTrainerName = isFlagship
                ? (e.getFlagshipProgram().getTrainerName())
                : (e.getCourse() != null ? e.getCourse().getTrainerName() : null);

        String displayName = isFlagship ? e.getFlagshipProgram().getTitle()
                : (e.getCourse() != null ? e.getCourse().getTitle() : "Unknown");
        Double displayPrice = isFlagship ? e.getFlagshipProgram().getPrice()
                : (e.getCourse() != null ? e.getCourse().getPrice() : null);

        return EnrollmentResponse.builder()
                .id(e.getId())
                .userId(e.getUser() != null ? e.getUser().getId() : null)
                .userName(e.getUser() != null ? e.getUser().getName() : "Unknown")
                .userEmail(e.getUser() != null ? e.getUser().getEmail() : "Unknown")
                .courseId(e.getCourse() != null ? e.getCourse().getId() : null)
                .courseName(displayName)
                .status(e.getStatus() != null ? e.getStatus().name() : "UNKNOWN")
                .coursePrice(displayPrice)
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
                .testLink(testLink)
                .testDescription(testDescription)
                .canGenerateCertificate(e.getMarks() != null)
                .trainerName(trainerName)
                .defaultTrainerName(defaultTrainerName)
                .isFlagship(isFlagship)
                .flagshipProgramId(isFlagship ? e.getFlagshipProgram().getId() : null)
                .flagshipProgramName(isFlagship ? e.getFlagshipProgram().getTitle() : null)
                .unenrolledAt(e.getUnenrolledAt() != null ? e.getUnenrolledAt().toString() : null)
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
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get dashboard analytics with optional date range filter")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        // Parse date range filters
        LocalDateTime filterFrom = null;
        LocalDateTime filterTo = null;
        if (from != null && !from.isBlank()) {
            filterFrom = LocalDate.parse(from).atStartOfDay();
        }
        if (to != null && !to.isBlank()) {
            filterTo = LocalDate.parse(to).atTime(23, 59, 59);
        }
        final LocalDateTime fFrom = filterFrom;
        final LocalDateTime fTo = filterTo;
        boolean hasFilter = fFrom != null || fTo != null;

        List<User> allUsers = userRepository.findAll();
        long totalCourses = courseRepository.count();

        // Filter users by date range (for user count + user growth)
        List<User> filteredUsers = allUsers;
        if (hasFilter) {
            filteredUsers = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null)
                    .filter(u -> fFrom == null || !u.getCreatedAt().isBefore(fFrom))
                    .filter(u -> fTo == null || !u.getCreatedAt().isAfter(fTo))
                    .collect(Collectors.toList());
        }
        long totalUsers = filteredUsers.size();

        // Get all enrollments and filter by date range
        List<Enrollment> allEnrollments = enrollmentRepository.findAll();
        List<Enrollment> filteredEnrollments = allEnrollments;
        if (hasFilter) {
            filteredEnrollments = allEnrollments.stream()
                    .filter(e -> e.getEnrolledAt() != null)
                    .filter(e -> fFrom == null || !e.getEnrolledAt().isBefore(fFrom))
                    .filter(e -> fTo == null || !e.getEnrolledAt().isAfter(fTo))
                    .collect(Collectors.toList());
        }

        // Filter confirmed enrollments (ENROLLED or COMPLETED, not PENDING)
        List<Enrollment> confirmedList = filteredEnrollments.stream()
                .filter(e -> e.getStatus() == Enrollment.Status.ENROLLED ||
                             e.getStatus() == Enrollment.Status.COMPLETED)
                .collect(Collectors.toList());

        long confirmedEnrollments = confirmedList.size();

        long completedEnrollments = filteredEnrollments.stream()
                .filter(e -> e.getStatus() == Enrollment.Status.COMPLETED)
                .count();

        // Calculate total revenue from paid enrollments (only ENROLLED or COMPLETED)
        double totalRevenue = confirmedList.stream()
                .filter(e -> e.getCourse() != null &&
                             e.getCourse().getPrice() != null &&
                             e.getCourse().getPrice() > 0)
                .mapToDouble(e -> e.getCourse().getPrice())
                .sum();

        // Get recent enrollments (last 10, only confirmed)
        List<RecentEnrollment> recentEnrollments = confirmedList.stream()
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

        // Determine chart month range
        YearMonth chartEnd = YearMonth.now();
        YearMonth chartStart;
        if (fFrom != null) {
            chartStart = YearMonth.from(fFrom);
        } else {
            chartStart = chartEnd.minusMonths(11); // default last 12 months
        }
        if (fTo != null) {
            chartEnd = YearMonth.from(fTo);
        }

        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");

        // ---- Monthly Enrollments ----
        List<MonthlyData> monthlyEnrollments = new ArrayList<>();
        for (YearMonth ym = chartStart; !ym.isAfter(chartEnd); ym = ym.plusMonths(1)) {
            final YearMonth currentYm = ym;
            long count = confirmedList.stream()
                    .filter(e -> e.getEnrolledAt() != null &&
                                 YearMonth.from(e.getEnrolledAt()).equals(currentYm))
                    .count();
            monthlyEnrollments.add(new MonthlyData(currentYm.format(monthFmt), count));
        }

        // ---- Revenue by Month ----
        List<MonthlyRevenue> revenueByMonth = new ArrayList<>();
        for (YearMonth ym = chartStart; !ym.isAfter(chartEnd); ym = ym.plusMonths(1)) {
            final YearMonth currentYm = ym;
            double rev = confirmedList.stream()
                    .filter(e -> e.getEnrolledAt() != null &&
                                 YearMonth.from(e.getEnrolledAt()).equals(currentYm) &&
                                 e.getCourse() != null &&
                                 e.getCourse().getPrice() != null &&
                                 e.getCourse().getPrice() > 0)
                    .mapToDouble(e -> e.getCourse().getPrice())
                    .sum();
            revenueByMonth.add(new MonthlyRevenue(currentYm.format(monthFmt), rev));
        }

        // ---- Popular Courses (top 10 by enrollment count) ----
        Map<String, Long> courseEnrollCounts = confirmedList.stream()
                .filter(e -> e.getCourse() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getCourse().getTitle() != null ? e.getCourse().getTitle() : "Unknown",
                        Collectors.counting()
                ));
        List<PopularCourse> popularCourses = courseEnrollCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(entry -> new PopularCourse(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // ---- User Growth ----
        final List<User> chartUsers = hasFilter ? allUsers : filteredUsers;
        List<MonthlyData> userGrowth = new ArrayList<>();
        for (YearMonth ym = chartStart; !ym.isAfter(chartEnd); ym = ym.plusMonths(1)) {
            final YearMonth currentYm = ym;
            long count = chartUsers.stream()
                    .filter(u -> u.getCreatedAt() != null &&
                                 YearMonth.from(u.getCreatedAt()).equals(currentYm))
                    .count();
            userGrowth.add(new MonthlyData(currentYm.format(monthFmt), count));
        }

        return ResponseEntity.ok(AnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .totalCourses(totalCourses)
                .totalEnrollments(confirmedEnrollments)
                .completedEnrollments(completedEnrollments)
                .pendingEnrollments(filteredEnrollments.size() - confirmedEnrollments)
                .totalRevenue(totalRevenue)
                .recentEnrollments(recentEnrollments)
                .monthlyEnrollments(monthlyEnrollments)
                .revenueByMonth(revenueByMonth)
                .popularCourses(popularCourses)
                .userGrowth(userGrowth)
                .build());
    }

    @GetMapping("/enrollments")
    @PreAuthorize("hasRole('ADMIN')")
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
        private long totalEnrollments;
        private long completedEnrollments;
        private long pendingEnrollments;
        private double totalRevenue;
        private List<RecentEnrollment> recentEnrollments;
        private List<MonthlyData> monthlyEnrollments;
        private List<MonthlyRevenue> revenueByMonth;
        private List<PopularCourse> popularCourses;
        private List<MonthlyData> userGrowth;
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
    @AllArgsConstructor
    static class MonthlyData {
        private String month;
        private long count;
    }

    @Data
    @AllArgsConstructor
    static class MonthlyRevenue {
        private String month;
        private double revenue;
    }

    @Data
    @AllArgsConstructor
    static class PopularCourse {
        private String name;
        private long enrollments;
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
        // Flagship program fields
        private Boolean isFlagship;
        private Long flagshipProgramId;
        private String flagshipProgramName;
        // Unenrollment audit
        private String unenrolledAt;
    }

    @PostMapping("/trigger-reminders")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Manually trigger course completion reminder emails (for testing)")
    public ResponseEntity<Map<String, String>> triggerReminders() {
        courseReminderScheduler.sendCourseReminders();
        return ResponseEntity.ok(Map.of("message", "Reminder job triggered. Check server logs for details."));
    }

    @PostMapping("/users/{userId}/grant-access")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Operation(summary = "Admin grant enrollment access to a user for a course, flagship, or bundle")
    public ResponseEntity<Map<String, Object>> grantAccess(
            @PathVariable Long userId,
            @RequestBody GrantAccessRequest req) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("User not found"));

        int count = 0;

        if (req.getCourseId() != null) {
            com.uyirgene.course.Course course = courseRepository.findById(req.getCourseId())
                    .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));
            enrollmentService.grantCourseEnrollment(user, course);
            count = 1;

        } else if (req.getFlagshipProgramId() != null) {
            com.uyirgene.course.FlagshipProgram program = flagshipProgramRepository.findById(req.getFlagshipProgramId())
                    .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Flagship program not found"));
            enrollmentService.grantFlagshipEnrollment(user, program);
            count = 1;

        } else if (req.getBundleId() != null) {
            List<com.uyirgene.course.Enrollment> enrollments =
                    courseBundleService.grantBundleEnrollment(user, req.getBundleId());
            count = enrollments.size();

        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "One of courseId, flagshipProgramId, or bundleId must be provided"));
        }

        return ResponseEntity.ok(Map.of("message", "Access granted successfully", "enrollmentCount", count));
    }

    @Data
    static class GrantAccessRequest {
        private Long courseId;
        private Long flagshipProgramId;
        private Long bundleId;
    }

    // ── Resend magic link access ─────────────────────────────────────────────────

    @PostMapping("/users/{userId}/resend-access-link")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: resend magic link access email to a guest-enrolled user")
    public ResponseEntity<?> resendAccessLink(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("User not found"));

        // Only resend if the account still has (or needs) a magic link
        // — i.e., the user has never explicitly set a password
        if (user.getMagicLinkToken() == null && user.getCreatedAt() != null
                && user.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(5))) {
            // Account exists but has no magic link token — user likely set a password already
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "This user has already set a password and can log in normally."));
        }

        String token = userService.generateMagicLinkToken(user);
        String magicLink = frontendUrl + "/magic-login?token=" + token;
        mailService.sendMagicLinkResend(user, magicLink);
        return ResponseEntity.ok(Map.of("message", "Access link sent to " + user.getEmail()));
    }

    // ── Create user manually ─────────────────────────────────────────────────────

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: create a user account manually")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest req) {
        try {
            Role role = req.getRole() != null ? req.getRole() : Role.STUDENT;
            User user = userService.register(req.getName(), req.getEmail(), req.getPassword(), role);
            return ResponseEntity.status(201).body(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Data
    static class CreateUserRequest {
        private String name;
        private String email;
        private String password;
        private Role role;
    }

    // ── Export users as CSV ──────────────────────────────────────────────────────

    @GetMapping("/users/export")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: download all users with enrollment & certificate details as CSV (one row per enrollment)")
    public ResponseEntity<byte[]> exportUsers() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        // Fetch all data in bulk to avoid N+1
        List<User> users = userRepository.findAll();
        List<Enrollment> allEnrollments = enrollmentRepository.findAll().stream()
                .filter(e -> e.getStatus() != Enrollment.Status.PENDING)
                .collect(Collectors.toList());
        List<Certificate> allCerts = certificateRepository.findAll();

        // Build lookup: userId -> enrollments
        Map<Long, List<Enrollment>> enrollmentsByUser = allEnrollments.stream()
                .collect(Collectors.groupingBy(e -> e.getUser().getId()));

        // Build lookup: (userId + courseId) or (userId + flagshipId) -> certificate
        Map<String, Certificate> certLookup = new HashMap<>();
        for (Certificate c : allCerts) {
            Long uid = c.getUser().getId();
            if (c.getCourse() != null)
                certLookup.put(uid + "_c_" + c.getCourse().getId(), c);
            else if (c.getFlagshipProgram() != null)
                certLookup.put(uid + "_f_" + c.getFlagshipProgram().getId(), c);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("User ID,Name,Email,Role,Account Status,Auth Provider,Joined,")
          .append("Enrollment ID,Course / Program,Program Type,Enrolled At,Enrollment Status,")
          .append("Marks (%),Certificate Type,Trainer,Certificate Number,Certificate Issued\n");

        for (User u : users) {
            String userPrefix = u.getId() + "," +
                    escapeCsv(u.getName()) + "," +
                    escapeCsv(u.getEmail()) + "," +
                    (u.getRole() != null ? u.getRole().name() : "") + "," +
                    (u.isEnabled() ? "Active" : "Disabled") + "," +
                    (u.getAuthProvider() != null ? u.getAuthProvider() : "LOCAL") + "," +
                    (u.getCreatedAt() != null ? u.getCreatedAt().format(fmt) : "");

            List<Enrollment> userEnrollments = enrollmentsByUser.getOrDefault(u.getId(), List.of());

            if (userEnrollments.isEmpty()) {
                sb.append(userPrefix).append(",,,,,,,,,\n");
            } else {
                for (Enrollment e : userEnrollments) {
                    String programName;
                    String programType;
                    Certificate cert = null;

                    if (e.getCourse() != null) {
                        programName = e.getCourse().getTitle();
                        programType = "Course";
                        cert = certLookup.get(u.getId() + "_c_" + e.getCourse().getId());
                    } else if (e.getFlagshipProgram() != null) {
                        programName = e.getFlagshipProgram().getTitle();
                        programType = "Flagship";
                        cert = certLookup.get(u.getId() + "_f_" + e.getFlagshipProgram().getId());
                    } else {
                        programName = "";
                        programType = "";
                    }

                    sb.append(userPrefix).append(",")
                      .append(e.getId()).append(",")
                      .append(escapeCsv(programName)).append(",")
                      .append(programType).append(",")
                      .append(e.getEnrolledAt() != null ? e.getEnrolledAt().format(fmt) : "").append(",")
                      .append(e.getStatus() != null ? e.getStatus().name() : "").append(",")
                      .append(e.getMarks() != null ? e.getMarks() : "").append(",")
                      .append(e.getCertificateType() != null ? e.getCertificateType().name() : "").append(",")
                      .append(escapeCsv(e.getTrainerName())).append(",")
                      .append(cert != null ? escapeCsv(cert.getCertificateId()) : "").append(",")
                      .append(cert != null && cert.getIssuedAt() != null ? cert.getIssuedAt().format(fmt) : "")
                      .append("\n");
                }
            }
        }

        byte[] csvBytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"users_export.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
