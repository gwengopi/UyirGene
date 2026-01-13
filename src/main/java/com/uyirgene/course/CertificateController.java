package com.uyirgene.course;

import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.time.format.DateTimeFormatter;
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

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");

    @PostMapping("/courses/{id}/certificate")
    @PreAuthorize("isAuthenticated()")
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
            @ApiResponse(responseCode = "404", description = "Certificate not found")
    })
    public ResponseEntity<?> downloadCertificate(@PathVariable("id") Long courseId) {
        User user = currentUserService.getCurrentUser();

        Course course = new Course();
        course.setId(courseId);

        Optional<Certificate> certOpt = certRepo.findByUserAndCourse(user, course);
        if (certOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Certificate not found. Complete the course to obtain a certificate."));
        }

        Certificate cert = certOpt.get();
        File file = new File(cert.getFilePath());
        if (!file.exists()) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Certificate file not found. Please regenerate the certificate."));
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

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "certificateId", cert.getCertificateId(),
                "studentName", cert.getUser().getName(),
                "courseName", cert.getCourse().getTitle(),
                "issuedAt", issuedDate,
                "message", "This certificate is valid and was issued by UyirGene."
        ));
    }

    @GetMapping("/courses/{id}/certificate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get certificate status for a course")
    public ResponseEntity<?> getCertificateStatus(@PathVariable("id") Long courseId) {
        User user = currentUserService.getCurrentUser();

        Course course = new Course();
        course.setId(courseId);

        Optional<Certificate> certOpt = certRepo.findByUserAndCourse(user, course);
        if (certOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "exists", false,
                    "message", "No certificate found. Complete the course to generate a certificate."
            ));
        }

        Certificate cert = certOpt.get();
        return ResponseEntity.ok(Map.of(
                "exists", true,
                "certificateId", cert.getCertificateId(),
                "issuedAt", cert.getIssuedAt() != null ? cert.getIssuedAt().format(DATE_FORMATTER) : null,
                "downloadUrl", "/api/courses/" + courseId + "/certificate/download"
        ));
    }
}
