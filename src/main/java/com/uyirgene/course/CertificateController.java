package com.uyirgene.course;

import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CertificateController {
    private final CertificateRepository certRepo;
    private final CurrentUserService currentUserService;
    private final CertificateService certificateService;

    @GetMapping("/{id}/certificate")
    @Operation(summary = "Download certificate PDF for completed course")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PDF certificate returned"),
            @ApiResponse(responseCode = "404", description = "Certificate not found")
    })
    public ResponseEntity<?> getCertificate(@PathVariable Long id) {
        User u = currentUserService.getCurrentUser();
        Course c = new Course();
        c.setId(id);
        Certificate cert = certRepo.findByUserAndCourse(u, c).orElse(null);
        if (cert == null) {
            return ResponseEntity.status(404).body("Certificate not found. Complete the course to obtain a certificate.");
        }
        FileSystemResource fs = new FileSystemResource(cert.getFilePath());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=certificate-" + cert.getCertificateId() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(fs);
    }
}