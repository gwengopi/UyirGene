package com.uyirgene.course;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uyirgene.course.payment.PaymentProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Handles Razorpay webhook events.
 *
 * Security: Every request is verified using HMAC-SHA256 of the raw body
 * signed with the webhook secret (configured separately in Razorpay dashboard).
 * This prevents attackers from faking webhook calls to unlock courses for free.
 *
 * The webhook secret is DIFFERENT from the API key secret.
 */
@RestController
@RequestMapping("/api/payment/webhook")
@RequiredArgsConstructor
@Slf4j
public class RazorpayWebhookController {

    @Value("${payment.razorpay.webhook-secret:}")
    private String webhookSecret;

    private final EnrollmentRepository enrollmentRepository;
    private final GuestEnrollmentService guestEnrollmentService;
    private final PaymentProvider paymentProvider;
    private final MailService mailService;
    private final ObjectMapper objectMapper;

    // Matches receipt strings like "anon-course-3", "anon-flagship-5", "anon-b-1,2-s3"
    private static final Pattern ANON_COURSE_RECEIPT    = Pattern.compile("^anon-course-(\\d+)$");
    private static final Pattern ANON_FLAGSHIP_RECEIPT  = Pattern.compile("^anon-flagship-(\\d+)$");
    // anon-b-{bundleId1},{bundleId2},...[-s{standaloneCourseId}]
    private static final Pattern ANON_BUNDLE_RECEIPT    = Pattern.compile("^anon-b-([\\d,]+?)(?:-s(\\d+))?$");

    @PostMapping
    @Transactional
    public ResponseEntity<Void> handleWebhook(
            HttpServletRequest request,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

        // Step 1: Read raw body bytes BEFORE any parsing.
        // Signature is computed over the exact raw bytes Razorpay sent.
        byte[] rawBody;
        try {
            rawBody = request.getInputStream().readAllBytes();
        } catch (Exception e) {
            log.error("Failed to read webhook body", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // Step 2: Reject if webhook secret is not configured
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.error("Razorpay webhook secret is not configured. Set RAZORPAY_WEBHOOK_SECRET env var.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        // Step 3: Reject missing signature header immediately
        if (signature == null || signature.isBlank()) {
            log.warn("Webhook received without X-Razorpay-Signature header — rejected");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Step 4: Verify HMAC-SHA256 signature using webhook secret
        // Attack prevention: without this, anyone could POST fake payment.captured events
        if (!verifyWebhookSignature(rawBody, signature)) {
            log.warn("Webhook signature verification failed — possible tampered request");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Step 5: Parse event and handle
        try {
            JsonNode root = objectMapper.readTree(rawBody);
            String event = root.path("event").asText();

            log.info("Razorpay webhook received: event={}", event);

            if ("payment.captured".equals(event)) {
                handlePaymentCaptured(root);
            }
            // Other events (payment.failed, refund.created, etc.) can be added here

        } catch (Exception e) {
            log.error("Error processing webhook payload", e);
            // Return 200 anyway — prevents Razorpay from retrying a malformed event
        }

        // Always return 200 after signature verification.
        // Non-200 causes Razorpay to retry the webhook multiple times.
        return ResponseEntity.ok().build();
    }

    private void handlePaymentCaptured(JsonNode root) {
        JsonNode paymentEntity = root.path("payload").path("payment").path("entity");

        String paymentId = paymentEntity.path("id").asText();
        String orderId = paymentEntity.path("order_id").asText();
        String status = paymentEntity.path("status").asText();

        log.info("payment.captured: paymentId={}, orderId={}, status={}", paymentId, orderId, status);

        if (orderId.isBlank()) {
            log.warn("Webhook payment.captured missing order_id — skipping");
            return;
        }

        // Find the enrollment linked to this Razorpay order
        Optional<Enrollment> enrollmentOpt = enrollmentRepository.findByPaymentOrderId(orderId);

        if (enrollmentOpt.isEmpty()) {
            log.warn("No enrollment found for orderId={} — checking if anonymous order", orderId);
            handleAnonymousOrder(orderId, paymentId);
            return;
        }

        Enrollment enrollment = enrollmentOpt.get();

        // Idempotency: skip if already confirmed (frontend /confirm may have arrived first)
        if (enrollment.getStatus() == Enrollment.Status.ENROLLED ||
                enrollment.getStatus() == Enrollment.Status.COMPLETED) {
            log.info("Enrollment already confirmed for orderId={} — webhook is a no-op", orderId);
            return;
        }

        // Confirm enrollment
        enrollment.setStatus(Enrollment.Status.ENROLLED);
        enrollmentRepository.save(enrollment);
        log.info("Enrollment confirmed via webhook for orderId={}, userId={}", orderId, enrollment.getUser().getId());

        // Send enrollment success email
        try {
            if (enrollment.getCourse() != null) {
                mailService.sendEnrollmentSuccess(enrollment.getUser(), enrollment.getCourse());
            } else if (enrollment.getFlagshipProgram() != null) {
                mailService.sendEnrollmentSuccess(enrollment.getUser(), enrollment.getFlagshipProgram());
            }
        } catch (Exception e) {
            // Non-critical — enrollment is already confirmed, don't fail the webhook
            log.error("Failed to send enrollment email after webhook confirmation", e);
        }
    }

    /**
     * Handles payment.captured for anonymous orders where no enrollment row exists yet.
     * Fetches the order receipt from Razorpay to determine the type (course/flagship),
     * then calls the appropriate guest enrollment confirmation method.
     * Webhook authenticity is already verified before this method is called.
     */
    private void handleAnonymousOrder(String orderId, String paymentId) {
        try {
            String receipt = paymentProvider.fetchOrderReceipt(orderId);
            if (receipt == null || receipt.isBlank()) {
                log.warn("Could not fetch receipt for orderId={} — cannot recover anonymous enrollment", orderId);
                return;
            }

            Matcher courseMatcher = ANON_COURSE_RECEIPT.matcher(receipt);
            if (courseMatcher.matches()) {
                Long courseId = Long.parseLong(courseMatcher.group(1));
                log.info("Anonymous course order detected: orderId={}, courseId={}", orderId, courseId);
                guestEnrollmentService.confirmAnonymousCourseOrderFromWebhook(courseId, paymentId, orderId);
                log.info("Anonymous course enrollment confirmed via webhook: orderId={}, courseId={}", orderId, courseId);
                return;
            }

            Matcher flagshipMatcher = ANON_FLAGSHIP_RECEIPT.matcher(receipt);
            if (flagshipMatcher.matches()) {
                Long programId = Long.parseLong(flagshipMatcher.group(1));
                log.info("Anonymous flagship order detected: orderId={}, programId={}", orderId, programId);
                guestEnrollmentService.confirmAnonymousFlagshipOrderFromWebhook(programId, paymentId, orderId);
                log.info("Anonymous flagship enrollment confirmed via webhook: orderId={}, programId={}", orderId, programId);
                return;
            }

            Matcher bundleMatcher = ANON_BUNDLE_RECEIPT.matcher(receipt);
            if (bundleMatcher.matches()) {
                List<Long> bundleIds = java.util.Arrays.stream(bundleMatcher.group(1).split(","))
                        .map(Long::parseLong).toList();
                Long standaloneCourseId = bundleMatcher.group(2) != null ? Long.parseLong(bundleMatcher.group(2)) : null;
                log.info("Anonymous bundle order detected: orderId={}, bundleIds={}, standalone={}", orderId, bundleIds, standaloneCourseId);
                guestEnrollmentService.confirmAnonymousBundleOrderFromWebhook(bundleIds, paymentId, orderId, standaloneCourseId);
                log.info("Anonymous bundle enrollment confirmed via webhook: orderId={}, bundleIds={}", orderId, bundleIds);
                return;
            }

            log.warn("Unrecognised anonymous receipt='{}' for orderId={}", receipt, orderId);

        } catch (Exception e) {
            log.error("Failed to recover anonymous enrollment for orderId={}: {}", orderId, e.getMessage(), e);
        }
    }

    /**
     * Verifies the Razorpay webhook signature.
     *
     * Razorpay signs the raw request body with HMAC-SHA256 using the webhook secret.
     * We compute the same HMAC and compare using constant-time equality
     * to prevent timing-based attacks.
     */
    private boolean verifyWebhookSignature(byte[] body, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hmac = mac.doFinal(body);
            String expected = HexFormat.of().formatHex(hmac);

            // Constant-time comparison — prevents timing attacks
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    signature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Webhook signature computation failed", e);
            return false;
        }
    }
}
