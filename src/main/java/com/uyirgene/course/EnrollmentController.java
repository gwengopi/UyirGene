package com.uyirgene.course;

import com.uyirgene.course.dto.EnrollmentResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @PostMapping("/{id}/enroll")
    @Operation(summary = "Enroll current user in a course")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Enrolled successfully"),
            @ApiResponse(responseCode = "200", description = "Already enrolled - returns existing enrollment"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<?> enroll(@PathVariable("id") Long id) {
        EnrollmentResult result = enrollmentService.startEnrollment(id);

        // If already enrolled, return 200 with message
        if (result.isAlreadyEnrolled()) {
            return ResponseEntity.ok(new EnrollmentResponse(
                    result.getEnrollment(),
                    null,
                    true,
                    result.getMessage()
            ));
        }

        // If result has a Razorpay order, return it for client to initiate payment
        if (result.getOrder() != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(new EnrollmentResponse(
                    null,
                    result.getOrder(),
                    false,
                    "Payment required"
            ));
        }

        // Otherwise enrollment completed (free course)
        return ResponseEntity.status(HttpStatus.CREATED).body(new EnrollmentResponse(
                result.getEnrollment(),
                null,
                false,
                "Successfully enrolled"
        ));
    }

    @PostMapping("/{id}/enroll/confirm")
    @Operation(summary = "Confirm payment for enrollment (idempotent)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Payment confirmed and enrolled"),
            @ApiResponse(responseCode = "400", description = "Invalid payment signature"),
            @ApiResponse(responseCode = "404", description = "Course or enrollment not found")
    })
    public ResponseEntity<?> confirmEnrollment(@PathVariable("id") Long id, @Valid @RequestBody PaymentConfirmDto dto) {
        Enrollment enrollment = enrollmentService.confirmEnrollmentPayment(
                id,
                dto.getRazorpayPaymentId(),
                dto.getRazorpayOrderId(),
                dto.getRazorpaySignature()
        );
        return ResponseEntity.ok(new EnrollmentResponse(enrollment, null, false, "Payment confirmed and enrolled successfully"));
    }

    @GetMapping("/enrolled")
    @Operation(summary = "List courses current user is enrolled in")
    @ApiResponse(responseCode = "200", description = "List of enrolled courses")
    public ResponseEntity<List<EnrollmentDto>> enrolled() {
        return ResponseEntity.ok(enrollmentService.listEnrolledEnrollments());
    }

    @DeleteMapping("/{id}/enroll")
    @Operation(summary = "Unenroll current user from a course")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Unenrolled"),
            @ApiResponse(responseCode = "404", description = "Course or enrollment not found")
    })
    public ResponseEntity<?> unenroll(@PathVariable("id") Long id) {
        enrollmentService.unenroll(id);
        return ResponseEntity.noContent().build();
    }

    // Note: Mark as Complete endpoint removed for users - completion is managed by admin only
    // Use /api/admin/enrollments/{id}/complete for admin completion

    @Data
    @AllArgsConstructor
    public static class EnrollmentResponse {
        private Enrollment enrollment;
        private EnrollmentResult.RazorpayOrder order;
        private boolean alreadyEnrolled;
        private String message;
    }

    public static class PaymentConfirmDto {
        @NotBlank(message = "Payment ID is required")
        private String razorpayPaymentId;

        @NotBlank(message = "Order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Signature is required")
        private String razorpaySignature;

        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    }
}