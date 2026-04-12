package com.uyirgene.course;

import com.uyirgene.config.SiteConfigService;
import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@Tag(name = "Certificates", description = "Certificate generation and verification APIs")
public class CertificateController {

    @Autowired
    private CertificateRepository certRepo;

    @Autowired
    private CurrentUserService currentUserService;

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private CourseRepository courseRepo;

    @Autowired
    private EnrollmentRepository enrollmentRepo;

    @Autowired
    private SiteConfigService siteConfigService;

    @org.springframework.beans.factory.annotation.Value("${app.certificate.folder:uploads/certificates}")
    private String certFolder;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");

    @PostMapping("/courses/{id}/certificate")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    @Operation(summary = "Generate certificate for a completed course")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Certificate generated successfully"),
            @ApiResponse(responseCode = "400", description = "Course not completed"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<?> generateCertificate(@PathVariable("id") Long courseId) {
        User user = currentUserService.getCurrentUser();

        Optional<Course> courseOpt = courseRepo.findById(courseId);
        if (courseOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
        }

        Course course = courseOpt.get();

        Optional<Enrollment> enrollmentOpt = enrollmentRepo.findByUserAndCourse(user, course);
        if (enrollmentOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "You are not enrolled in this course"));
        }

        Enrollment enrollment = enrollmentOpt.get();
        if (enrollment.getStatus() != Enrollment.Status.COMPLETED) {
            return ResponseEntity.status(400).body(Map.of("error", "You must complete the course before generating a certificate"));
        }

        Certificate certificate = certificateService.generateCertificate(user, course);

        return ResponseEntity.ok(Map.of(
                "message", "Certificate generated successfully",
                "certificateId", certificate.getCertificateId(),
                "downloadUrl", "/api/courses/" + courseId + "/certificate/download"
        ));
    }

    @GetMapping("/courses/{id}/certificate/download")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download certificate PDF for completed course")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PDF certificate returned"),
            @ApiResponse(responseCode = "403", description = "Results not yet published"),
            @ApiResponse(responseCode = "404", description = "Certificate not found")
    })
    public ResponseEntity<?> downloadCertificate(@PathVariable("id") Long courseId) {
        User user = currentUserService.getCurrentUser();

        Course course = courseRepo.findById(courseId).orElse(null);
        if (course == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
        }

        // Check enrollment and result publication status
        Optional<Enrollment> enrollmentOpt = enrollmentRepo.findByUserAndCourse(user, course);
        if (enrollmentOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "You are not enrolled in this course"));
        }

        Enrollment enrollment = enrollmentOpt.get();

        // Check if result is published - only allow download after result is published
        if (enrollment.getResultPublishedAt() == null) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Results not yet published. Certificate download will be available after results are published."));
        }

        Optional<Certificate> certOpt = certRepo.findByUserAndCourse(user, course);
        if (certOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Certificate not found. Please wait for admin to generate your certificate."));
        }

        Certificate cert = certOpt.get();
        File file = new File(cert.getFilePath());

        // Path traversal prevention: ensure file is within the certificate folder
        try {
            Path certDir = Path.of(certFolder).toAbsolutePath().normalize();
            Path filePath = file.toPath().toAbsolutePath().normalize();
            if (!filePath.startsWith(certDir)) {
                return ResponseEntity.status(403)
                        .body(Map.of("error", "Access denied"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Certificate path validation failed"));
        }

        if (!file.exists()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Certificate file not found. Please contact admin to regenerate the certificate."));
        }

        FileSystemResource fs = new FileSystemResource(file);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=certificate-" + cert.getCertificateId() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(fs);
    }

    @GetMapping("/certificates/verify/{certificateId}")
    @Operation(summary = "Verify a certificate by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Certificate is valid"),
            @ApiResponse(responseCode = "404", description = "Certificate not found or invalid")
    })
    public ResponseEntity<?> verifyCertificate(@PathVariable("certificateId") String certificateId) {
        Optional<Certificate> certOpt = certificateService.verifyCertificate(certificateId);

        if (certOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "valid", false,
                    "error", "Certificate not found or invalid"
            ));
        }

        Certificate cert = certOpt.get();
        String issuedDate = cert.getIssuedAt() != null
                ? cert.getIssuedAt().format(DATE_FORMATTER)
                : "Unknown";

        String programName;
        if (cert.getCourse() != null) {
            programName = cert.getCourse().getTitle();
        } else if (cert.getFlagshipProgram() != null) {
            programName = cert.getFlagshipProgram().getTitle();
        } else {
            programName = "Unknown Program";
        }

        Map<String, Object> verifyResponse = new HashMap<>();
        verifyResponse.put("valid", true);
        verifyResponse.put("certificateId", cert.getCertificateId());
        verifyResponse.put("studentName", cert.getUser().getName());
        verifyResponse.put("courseName", programName);
        verifyResponse.put("issuedAt", issuedDate);
        verifyResponse.put("certificateType", cert.getType() != null ? cert.getType().name() : Certificate.CertificateType.COMPLETION.name());
        verifyResponse.put("message", "This certificate is valid and was issued by UyirGene.");
        return ResponseEntity.ok(verifyResponse);
    }

    @GetMapping("/courses/{id}/certificate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get certificate status for a course")
    public ResponseEntity<?> getCertificateStatus(@PathVariable("id") Long courseId) {
        User user = currentUserService.getCurrentUser();

        Course course = courseRepo.findById(courseId).orElse(null);
        if (course == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
        }

        // Get enrollment to check result publication status
        Optional<Enrollment> enrollmentOpt = enrollmentRepo.findByUserAndCourse(user, course);
        if (enrollmentOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "You are not enrolled in this course"));
        }

        Enrollment enrollment = enrollmentOpt.get();

        // Check if result is published (only then show certificate)
        boolean resultPublished = enrollment.getResultPublishedAt() != null;

        Optional<Certificate> certOpt = certRepo.findByUserAndCourse(user, course);
        if (certOpt.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("exists", false);
            response.put("resultPublished", resultPublished);
            response.put("message", resultPublished
                    ? "Certificate not yet generated. Please wait for admin to generate your certificate."
                    : "Results not yet published. Certificate will be available after results are published.");
            return ResponseEntity.ok(response);
        }

        // Certificate exists - but can only be downloaded if result is published
        Certificate cert = certOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("exists", true);
        response.put("resultPublished", resultPublished);
        response.put("certificateId", cert.getCertificateId());
        response.put("certificateType", cert.getType() != null ? cert.getType().name() : null);
        response.put("issuedAt", cert.getIssuedAt() != null ? cert.getIssuedAt().format(DATE_FORMATTER) : null);
        response.put("canDownload", resultPublished);
        response.put("downloadUrl", resultPublished ? "/api/courses/" + courseId + "/certificate/download" : null);
        response.put("marks", cert.getMarks());

        if (!resultPublished) {
            response.put("message", "Certificate generated but results not yet published. Download will be available after results are published.");
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/courses/{id}/my-enrollment")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's enrollment details for a course")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Enrollment details"),
            @ApiResponse(responseCode = "404", description = "Not enrolled")
    })
    public ResponseEntity<?> getMyEnrollment(@PathVariable("id") Long courseId) {
        User user = currentUserService.getCurrentUser();

        Course course = courseRepo.findById(courseId).orElse(null);
        if (course == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
        }

        Optional<Enrollment> enrollmentOpt = enrollmentRepo.findByUserAndCourse(user, course);
        if (enrollmentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "You are not enrolled in this course"));
        }

        Enrollment enrollment = enrollmentOpt.get();

        // Get result delay hours from config
        int resultDelayHours = getResultDelayHours();

        // Check if results can be viewed
        boolean resultPublished = enrollment.getResultPublishedAt() != null;
        boolean testCompleted = enrollment.getTestCompletedAt() != null;

        // Calculate when results will be visible (if test completed but not yet published)
        LocalDateTime resultsVisibleAt = null;
        if (testCompleted && !resultPublished) {
            resultsVisibleAt = enrollment.getTestCompletedAt().plusHours(resultDelayHours);
        }

        // Check if certificate exists
        Optional<Certificate> certOpt = certRepo.findByUserAndCourse(user, course);
        boolean hasCertificate = certOpt.isPresent();
        String certificateId = certOpt.map(Certificate::getCertificateId).orElse(null);
        String certificateType = certOpt.map(c -> c.getType() != null ? c.getType().name() : null).orElse(null);

        // Build response - only show marks if result is published
        UserEnrollmentResponse response = UserEnrollmentResponse.builder()
                .enrollmentId(enrollment.getId())
                .courseId(course.getId())
                .courseName(course.getTitle())
                .status(enrollment.getStatus() != null ? enrollment.getStatus().name() : null)
                .enrolledAt(enrollment.getEnrolledAt() != null ? enrollment.getEnrolledAt().toString() : null)
                .hasTestLink(course.getTestLink() != null && !course.getTestLink().isEmpty())
                .testLink(course.getTestLink())
                .testDescription(course.getTestDescription())
                .testCompleted(testCompleted)
                .testCompletedAt(enrollment.getTestCompletedAt() != null ? enrollment.getTestCompletedAt().toString() : null)
                .resultPublished(resultPublished)
                .resultPublishedAt(enrollment.getResultPublishedAt() != null ? enrollment.getResultPublishedAt().toString() : null)
                .resultsVisibleAt(resultsVisibleAt != null ? resultsVisibleAt.toString() : null)
                // Only show marks if result is published
                .marks(resultPublished ? enrollment.getMarks() : null)
                .certificateType(resultPublished ? certificateType : null)
                .hasCertificate(hasCertificate && resultPublished)
                .certificateId(resultPublished ? certificateId : null)
                .canDownloadCertificate(hasCertificate && resultPublished)
                .downloadUrl(hasCertificate && resultPublished ? "/api/courses/" + courseId + "/certificate/download" : null)
                .build();

        return ResponseEntity.ok(response);
    }

    private int getResultDelayHours() {
        String delayStr = siteConfigService.getConfigValue("RESULT_DELAY_HOURS", "48");
        try {
            return Integer.parseInt(delayStr);
        } catch (NumberFormatException e) {
            return 48;
        }
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class UserEnrollmentResponse {
        private Long enrollmentId;
        private Long courseId;
        private String courseName;
        private String status;
        private String enrolledAt;
        private Boolean hasTestLink;
        private String testLink;
        private String testDescription;
        private Boolean testCompleted;
        private String testCompletedAt;
        private Boolean resultPublished;
        private String resultPublishedAt;
        private String resultsVisibleAt;
        private Double marks;
        private String certificateType;
        private Boolean hasCertificate;
        private String certificateId;
        private Boolean canDownloadCertificate;
        private String downloadUrl;
    }
}
