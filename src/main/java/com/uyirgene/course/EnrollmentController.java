package com.uyirgene.course;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @PostMapping("/{id}/enroll")
    @Operation(summary = "Enroll current user in a course")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Enrolled"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<?> enroll(@PathVariable("id") Long id) {
        var result = enrollmentService.startEnrollment(id);
        // If result has a Razorpay order, return it for client to initiate payment
        if (result.getOrder() != null) {
            return ResponseEntity.status(201).body(result.getOrder());
        }
        // Otherwise enrollment already completed (free course)
        return ResponseEntity.status(201).body(result.getEnrollment());
    }

    @PostMapping("/{id}/enroll/confirm")
    @Operation(summary = "Confirm payment for enrollment")
    public ResponseEntity<?> confirmEnrollment(@PathVariable("id") Long id, @Valid @RequestBody PaymentConfirmDto dto) {
        enrollmentService.confirmEnrollmentPayment(id, dto.getRazorpayPaymentId(), dto.getRazorpayOrderId(), dto.getRazorpaySignature());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/enrolled")
    @Operation(summary = "List courses current user is enrolled in")
    @ApiResponse(responseCode = "200", description = "List of enrolled courses")
    public ResponseEntity<java.util.List<com.uyirgene.course.EnrollmentDto>> enrolled() {
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

    @PostMapping("/{id}/complete")
    @Operation(summary = "Mark current user's enrollment as completed")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Marked completed"),
            @ApiResponse(responseCode = "404", description = "Course or enrollment not found")
    })
    public ResponseEntity<?> complete(@PathVariable("id") Long id) {
        enrollmentService.completeEnrollment(id);
        return ResponseEntity.ok().build();
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