package com.uyirgene.course;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketing")
@RequiredArgsConstructor
public class MarketingCampaignController {

    private final MarketingCampaignService campaignService;

    record TriggerRequest(
            String name,
            String subject,
            String htmlBody
    ) {}

    /** Trigger a new campaign */
    @PostMapping("/campaigns")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> triggerCampaign(@RequestBody TriggerRequest req, Authentication auth) {
        try {
            String adminEmail = auth != null ? auth.getName() : "unknown";
            MarketingCampaign campaign = campaignService.triggerCampaign(
                    req.name(), req.subject(), req.htmlBody(), adminEmail);
            return ResponseEntity.ok(campaign);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Campaign history */
    @GetMapping("/campaigns")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MarketingCampaign>> getHistory() {
        return ResponseEntity.ok(campaignService.getHistory());
    }

    /** Active campaign or {active: false} */
    @GetMapping("/campaigns/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getActive() {
        MarketingCampaign active = campaignService.getActiveCampaign();
        if (active == null) return ResponseEntity.ok(Map.of("active", false));
        return ResponseEntity.ok(active);
    }

    /** Opted-in user count + batch/day estimate */
    @GetMapping("/campaigns/estimate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getEstimate() {
        long count = campaignService.countOptedInUsers();
        int batchSize = 500;
        int batches = (int) Math.max(1, Math.ceil((double) count / batchSize));
        return ResponseEntity.ok(Map.of(
                "recipientCount", count,
                "batchSize", batchSize,
                "estimatedBatches", batches,
                "estimatedDays", batches
        ));
    }

    /**
     * Look up a course or flagship program by code.
     * Returns: { type, name, url } or 404.
     */
    @GetMapping("/campaigns/lookup-code")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> lookupCode(@RequestParam String code) {
        Map<String, String> result = campaignService.lookupReferenceCode(code);
        if (result == null) {
            return ResponseEntity.status(404).body(Map.of("error", "No course or flagship program found with code: " + code));
        }
        return ResponseEntity.ok(result);
    }

    /** Cancel a campaign */
    @PostMapping("/campaigns/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cancelCampaign(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(campaignService.cancelCampaign(id));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Resolved marketing settings for preview (fromName, footerAddress) */
    @GetMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSettings() {
        return ResponseEntity.ok(campaignService.getResolvedSettings());
    }

    /** Public unsubscribe */
    @GetMapping("/unsubscribe")
    public ResponseEntity<?> unsubscribe(@RequestParam String token) {
        try {
            campaignService.unsubscribe(token);
            return ResponseEntity.ok(Map.of("success", true,
                    "message", "You have been unsubscribed from marketing emails."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false,
                    "message", "Invalid or expired unsubscribe link."));
        }
    }
}
