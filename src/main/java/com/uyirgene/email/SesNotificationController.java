package com.uyirgene.email;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uyirgene.user.User;
import com.uyirgene.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Receives SES bounce and complaint notifications from AWS SNS.
 *
 * Setup (one-time in AWS console):
 * 1. SES → Configuration Sets → Create a configuration set
 * 2. Add event destinations: Bounces + Complaints → SNS topic
 * 3. SNS → Create topic (Standard) → Create subscription → HTTPS
 *    Endpoint: https://api.uyirgene.com/api/ses/notification
 * 4. On first call, SNS sends a SubscriptionConfirmation — this endpoint
 *    auto-confirms it by following the SubscribeURL.
 *
 * Why this is required:
 * SES does NOT automatically suppress bounced addresses. If bounce rate > 5%
 * or complaint rate > 0.1%, AWS suspends your SES sending account.
 * This handler marks bounced/complained users so MailService skips them.
 */
@RestController
@RequestMapping("/api/ses/notification")
@RequiredArgsConstructor
@Slf4j
public class SesNotificationController {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<Void> handleSnsNotification(
            @RequestHeader(value = "x-amz-sns-message-type", required = false) String messageType,
            @RequestBody String rawBody) {

        try {
            JsonNode root = objectMapper.readTree(rawBody);
            String type = root.path("Type").asText();

            // SNS sends a confirmation request on first subscription — auto-confirm it
            if ("SubscriptionConfirmation".equals(type)) {
                String subscribeUrl = root.path("SubscribeURL").asText();
                log.info("SNS SubscriptionConfirmation received — confirming: {}", subscribeUrl);
                confirmSubscription(subscribeUrl);
                return ResponseEntity.ok().build();
            }

            if (!"Notification".equals(type)) {
                return ResponseEntity.ok().build();
            }

            // The actual SES event is nested inside the SNS Message field
            String message = root.path("Message").asText();
            JsonNode sesEvent = objectMapper.readTree(message);
            String notificationType = sesEvent.path("notificationType").asText();

            switch (notificationType) {
                case "Bounce" -> handleBounce(sesEvent);
                case "Complaint" -> handleComplaint(sesEvent);
                default -> log.debug("SES notification type '{}' — no action needed", notificationType);
            }

        } catch (Exception e) {
            log.error("Error processing SNS/SES notification: {}", e.getMessage(), e);
        }

        return ResponseEntity.ok().build();
    }

    private void handleBounce(JsonNode sesEvent) {
        String bounceType = sesEvent.path("bounce").path("bounceType").asText();
        JsonNode recipients = sesEvent.path("bounce").path("bouncedRecipients");

        // Only permanently suppress hard bounces — soft bounces (e.g. mailbox full) are transient
        if (!"Permanent".equals(bounceType)) {
            log.info("SES soft bounce ({}) — not suppressing", bounceType);
            return;
        }

        for (JsonNode recipient : recipients) {
            String email = recipient.path("emailAddress").asText();
            markEmailBounced(email, "HARD_BOUNCE");
        }
    }

    private void handleComplaint(JsonNode sesEvent) {
        JsonNode recipients = sesEvent.path("complaint").path("complainedRecipients");
        for (JsonNode recipient : recipients) {
            String email = recipient.path("emailAddress").asText();
            markEmailBounced(email, "COMPLAINT");
            markMarketingOptOut(email);
        }
    }

    private void markEmailBounced(String email, String bounceType) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEmailBounced(true);
            user.setEmailBouncedAt(LocalDateTime.now());
            user.setEmailBounceType(bounceType);
            userRepository.save(user);
            log.info("Marked user {} as email bounced (type={})", email, bounceType);
        } else {
            log.warn("SES bounce/complaint for unknown email: {}", email);
        }
    }

    private void markMarketingOptOut(String email) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            user.setMarketingOptOut(true);
            userRepository.save(user);
            log.info("Auto-unsubscribed {} from marketing after complaint", email);
        });
    }

    private void confirmSubscription(String subscribeUrl) {
        try {
            new java.net.URI(subscribeUrl).toURL().openStream().close();
            log.info("SNS subscription confirmed successfully");
        } catch (Exception e) {
            log.error("Failed to confirm SNS subscription: {}", e.getMessage());
        }
    }
}
