package com.uyirgene.course;

import com.uyirgene.course.dto.EnrollmentResult;
import com.uyirgene.exception.PaymentException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Public (no auth required) enrollment endpoints for guest users.
 * These endpoints mirror the authenticated enrollment flow but accept guest contact details
 * (name, email, phone) instead of relying on a JWT-authenticated session.
 */
@RestController
@RequestMapping("/api/guest")
@RequiredArgsConstructor
public class GuestEnrollmentController {

    private final GuestEnrollmentService guestEnrollmentService;

    // ── Course ───────────────────────────────────────────────────────────────────

    @PostMapping("/courses/{courseId}/enroll")
    public ResponseEntity<?> startCourseEnrollment(
            @PathVariable Long courseId,
            @RequestBody GuestEnrollRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        if (req.getName() == null || req.getName().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Name is required"));
        if (req.getPhone() == null || req.getPhone().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required"));
        try {
            EnrollmentResult result = guestEnrollmentService.startGuestCourseEnrollment(
                    req.getName(), req.getEmail(), req.getPhone(),
                    courseId, req.getCountryCode());

            if (result.isAlreadyEnrolled()) {
                return ResponseEntity.status(409)
                        .body(Map.of("message", "You are already enrolled in this course. Please log in to access it."));
            }
            return ResponseEntity.ok(result.getOrder() != null ? result.getOrder() : result.getEnrollment());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/courses/{courseId}/enroll/confirm")
    public ResponseEntity<?> confirmCoursePayment(
            @PathVariable Long courseId,
            @RequestBody GuestConfirmRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        try {
            Enrollment enrollment = guestEnrollmentService.confirmGuestCoursePayment(
                    req.getEmail(), courseId,
                    req.getRazorpayPaymentId(), req.getRazorpayOrderId(), req.getRazorpaySignature());
            return ResponseEntity.ok(Map.of("message", "Enrollment confirmed. Check your email for access details."));
        } catch (PaymentException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Flagship ─────────────────────────────────────────────────────────────────

    @PostMapping("/flagship/{programId}/enroll")
    public ResponseEntity<?> startFlagshipEnrollment(
            @PathVariable Long programId,
            @RequestBody GuestEnrollRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        if (req.getName() == null || req.getName().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Name is required"));
        if (req.getPhone() == null || req.getPhone().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required"));
        try {
            EnrollmentResult result = guestEnrollmentService.startGuestFlagshipEnrollment(
                    req.getName(), req.getEmail(), req.getPhone(),
                    programId, req.getCountryCode());

            if (result.isAlreadyEnrolled()) {
                return ResponseEntity.status(409)
                        .body(Map.of("message", "You are already enrolled in this program. Please log in to access it."));
            }
            return ResponseEntity.ok(result.getOrder() != null ? result.getOrder() : result.getEnrollment());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/flagship/{programId}/enroll/confirm")
    public ResponseEntity<?> confirmFlagshipPayment(
            @PathVariable Long programId,
            @RequestBody GuestConfirmRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        try {
            guestEnrollmentService.confirmGuestFlagshipPayment(
                    req.getEmail(), programId,
                    req.getRazorpayPaymentId(), req.getRazorpayOrderId(), req.getRazorpaySignature());
            return ResponseEntity.ok(Map.of("message", "Enrollment confirmed. Check your email for access details."));
        } catch (PaymentException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Bundle ───────────────────────────────────────────────────────────────────

    @PostMapping("/bundles/enroll/multi")
    public ResponseEntity<?> startGuestBundleEnrollment(@RequestBody GuestBundleEnrollRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        if (req.getName() == null || req.getName().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Name is required"));
        if (req.getPhone() == null || req.getPhone().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required"));
        if (req.getBundleIds() == null || req.getBundleIds().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "Bundle selection is required"));
        try {
            CourseBundleService.MultiEnrollmentResult result = guestEnrollmentService.startGuestBundleEnrollment(
                    req.getName(), req.getEmail(), req.getPhone(),
                    req.getBundleIds(), req.getCountryCode(), req.getStandaloneCourseId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/bundles/enroll/multi/confirm")
    public ResponseEntity<?> confirmGuestBundlePayment(@RequestBody GuestBundleConfirmRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        try {
            guestEnrollmentService.confirmGuestBundlePayment(
                    req.getEmail(), req.getBundleIds(),
                    req.getRazorpayPaymentId(), req.getRazorpayOrderId(), req.getRazorpaySignature(),
                    req.getStandaloneCourseId());
            return ResponseEntity.ok(Map.of("message", "Enrollment confirmed. Check your email for access details."));
        } catch (PaymentException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Anonymous (Razorpay-collect) enrollment ───────────────────────────────────

    @PostMapping("/courses/{courseId}/anon-enroll")
    public ResponseEntity<?> startAnonCourseEnrollment(
            @PathVariable Long courseId,
            @RequestBody Map<String, String> req) {
        try {
            var order = guestEnrollmentService.startAnonymousCourseOrder(courseId, req.get("countryCode"));
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/courses/{courseId}/anon-confirm")
    public ResponseEntity<?> confirmAnonCourseEnrollment(
            @PathVariable Long courseId,
            @RequestBody AnonConfirmRequest req) {
        try {
            guestEnrollmentService.confirmAnonymousCourseOrder(
                    courseId, req.getRazorpayPaymentId(), req.getRazorpayOrderId(), req.getRazorpaySignature());
            return ResponseEntity.ok(Map.of("message", "Enrollment confirmed. Check your email for access details."));
        } catch (com.uyirgene.exception.PaymentException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/flagship/{programId}/anon-enroll")
    public ResponseEntity<?> startAnonFlagshipEnrollment(
            @PathVariable Long programId,
            @RequestBody Map<String, String> req) {
        try {
            var order = guestEnrollmentService.startAnonymousFlagshipOrder(programId, req.get("countryCode"));
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/flagship/{programId}/anon-confirm")
    public ResponseEntity<?> confirmAnonFlagshipEnrollment(
            @PathVariable Long programId,
            @RequestBody AnonConfirmRequest req) {
        try {
            guestEnrollmentService.confirmAnonymousFlagshipOrder(
                    programId, req.getRazorpayPaymentId(), req.getRazorpayOrderId(), req.getRazorpaySignature());
            return ResponseEntity.ok(Map.of("message", "Enrollment confirmed. Check your email for access details."));
        } catch (com.uyirgene.exception.PaymentException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/bundles/anon-enroll")
    public ResponseEntity<?> startAnonBundleEnrollment(@RequestBody AnonBundleEnrollRequest req) {
        if (req.getBundleIds() == null || req.getBundleIds().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "Bundle selection is required"));
        try {
            var result = guestEnrollmentService.startAnonymousBundleOrder(
                    req.getBundleIds(), req.getCountryCode(), req.getStandaloneCourseId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/bundles/anon-confirm")
    public ResponseEntity<?> confirmAnonBundleEnrollment(@RequestBody AnonBundleConfirmRequest req) {
        try {
            guestEnrollmentService.confirmAnonymousBundleOrder(
                    req.getBundleIds(), req.getRazorpayPaymentId(), req.getRazorpayOrderId(),
                    req.getRazorpaySignature(), req.getStandaloneCourseId());
            return ResponseEntity.ok(Map.of("message", "Enrollment confirmed. Check your email for access details."));
        } catch (com.uyirgene.exception.PaymentException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Request DTOs ─────────────────────────────────────────────────────────────

    @Data
    public static class GuestEnrollRequest {
        private String name;
        private String email;
        private String phone;
        private String countryCode;
    }

    @Data
    public static class GuestConfirmRequest {
        private String email;
        private String razorpayPaymentId;
        private String razorpayOrderId;
        private String razorpaySignature;
    }

    @Data
    public static class GuestBundleEnrollRequest {
        private String name;
        private String email;
        private String phone;
        private String countryCode;
        private List<Long> bundleIds;
        private Long standaloneCourseId;
    }

    @Data
    public static class GuestBundleConfirmRequest {
        private String email;
        private List<Long> bundleIds;
        private Long standaloneCourseId;
        private String razorpayPaymentId;
        private String razorpayOrderId;
        private String razorpaySignature;
    }

    @Data
    public static class AnonConfirmRequest {
        private String razorpayPaymentId;
        private String razorpayOrderId;
        private String razorpaySignature;
    }

    @Data
    public static class AnonBundleEnrollRequest {
        private List<Long> bundleIds;
        private String countryCode;
        private Long standaloneCourseId;
    }

    @Data
    public static class AnonBundleConfirmRequest {
        private List<Long> bundleIds;
        private Long standaloneCourseId;
        private String razorpayPaymentId;
        private String razorpayOrderId;
        private String razorpaySignature;
    }

    @Data
    public static class EnrollmentCheckRequest {
        private String email;
        private Long courseId;
        private List<Long> bundleIds;
        private Long flagshipProgramId;
    }

    @PostMapping("/check-enrollment")
    public ResponseEntity<?> checkEnrollment(@RequestBody EnrollmentCheckRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        boolean enrolled = guestEnrollmentService.isAlreadyEnrolled(
                req.getEmail(), req.getCourseId(), req.getBundleIds(), req.getFlagshipProgramId());
        return ResponseEntity.ok(Map.of("enrolled", enrolled));
    }

    // ── Free enrollment (no payment required) ────────────────────────────────

    @PostMapping("/courses/{courseId}/free-enroll")
    public ResponseEntity<?> freeEnrollCourse(
            @PathVariable Long courseId,
            @RequestBody Map<String, String> req) {
        String email = req.get("email");
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        try {
            guestEnrollmentService.enrollGuestFreeCourse(email, courseId);
            return ResponseEntity.ok(Map.of("message", "Enrollment confirmed. Check your email for access details."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/flagship/{programId}/free-enroll")
    public ResponseEntity<?> freeEnrollFlagship(
            @PathVariable Long programId,
            @RequestBody Map<String, String> req) {
        String email = req.get("email");
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        try {
            guestEnrollmentService.enrollGuestFlagshipFree(email, programId);
            return ResponseEntity.ok(Map.of("message", "Enrollment confirmed. Check your email for access details."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
