package com.uyirgene.course;

import com.uyirgene.config.SiteConfigService;
import com.uyirgene.user.User;
import com.uyirgene.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketingCampaignService {

    private final MarketingCampaignRepository campaignRepository;
    private final MarketingMailLogRepository logRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final SiteConfigService siteConfigService;
    private final CourseRepository courseRepository;
    private final FlagshipProgramRepository flagshipProgramRepository;

    /**
     * Self-injection via @Lazy so that @Async works correctly when calling
     * sendBatchAsync from within this same bean (Spring AOP proxy bypass fix).
     */
    @Autowired
    @Lazy
    private MarketingCampaignService self;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.mail.from:}")
    private String mailFrom;

    @Value("${app.name:UyirGene}")
    private String appName;

    @Value("${app.marketing.mail.host:}")
    private String marketingMailHost;

    @Value("${app.marketing.mail.port:587}")
    private int marketingMailPort;

    @Value("${app.marketing.mail.username:}")
    private String marketingMailUsername;

    @Value("${app.marketing.mail.password:}")
    private String marketingMailPassword;

    /** Regex matching [[CTA:CODE]] or [[CTA:CODE|Button Label]] placeholders. */
    private static final Pattern CTA_PATTERN = Pattern.compile(
            "\\[\\[CTA:([A-Za-z0-9\\-_]+)(?:\\|([^\\]]+))?\\]\\]",
            Pattern.CASE_INSENSITIVE
    );

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Trigger a new marketing campaign.
     * Only one PENDING/IN_PROGRESS campaign at a time.
     *
     * CTA buttons are embedded inline in htmlBody using the syntax:
     *   [[CTA:COURSE-CODE|Button Label]]
     *   [[CTA:FP-FLAGSHIP-CODE|Enrol Now]]
     * These placeholders are resolved to HTML buttons before the campaign is saved.
     */
    @Transactional
    public MarketingCampaign triggerCampaign(String name, String subject, String htmlBody,
                                              String adminEmail) {
        // Conflict check
        campaignRepository.findFirstByStatusIn(
                List.of(MarketingCampaign.Status.PENDING, MarketingCampaign.Status.IN_PROGRESS)
        ).ifPresent(c -> {
            throw new IllegalStateException("Another campaign is already active: " + c.getName());
        });

        // Convert plain text → HTML, then resolve [[CTA:CODE|Label]] → button HTML
        String processedBody = resolveCtaPlaceholders(plainTextToHtml(htmlBody));

        // Ensure every opted-in user has a token
        List<User> recipients = userRepository.findByMarketingOptOutFalseOrMarketingOptOutIsNull();
        for (User u : recipients) {
            if (u.getMarketingOptOutToken() == null || u.getMarketingOptOutToken().isBlank()) {
                u.setMarketingOptOutToken(generateToken());
                userRepository.save(u);
            }
        }

        int batchSize = 500;
        int total = recipients.size();
        int totalBatches = Math.max(1, (int) Math.ceil((double) total / batchSize));

        MarketingCampaign campaign = MarketingCampaign.builder()
                .name(name)
                .subject(subject)
                .htmlBody(processedBody)
                .totalRecipients(total)
                .totalBatches(totalBatches)
                .batchesSent(0)
                .batchSize(batchSize)
                .status(total == 0 ? MarketingCampaign.Status.COMPLETED : MarketingCampaign.Status.IN_PROGRESS)
                .triggeredBy(adminEmail)
                .triggeredAt(LocalDateTime.now())
                .build();
        campaign = campaignRepository.save(campaign);

        if (total == 0) {
            campaign.setCompletedAt(LocalDateTime.now());
            campaignRepository.save(campaign);
            return campaign;
        }

        // Create all log rows upfront
        List<MarketingMailLog> logs = new ArrayList<>();
        for (int i = 0; i < total; i++) {
            User u = recipients.get(i);
            int batchNumber = (i / batchSize) + 1;
            logs.add(MarketingMailLog.builder()
                    .campaign(campaign)
                    .userId(u.getId())
                    .email(u.getEmail())
                    .batchNumber(batchNumber)
                    .status(MarketingMailLog.Status.PENDING)
                    .build());
        }
        logRepository.saveAll(logs);

        // Send first batch via self-proxy so @Async fires correctly
        MarketingCampaign finalCampaign = campaign;
        self.sendBatchAsync(finalCampaign, 1);
        return campaign;
    }

    /**
     * Send a specific batch asynchronously.
     * Called through self-proxy to ensure @Async is honoured.
     */
    @Async
    @Transactional
    public void sendBatchAsync(MarketingCampaign campaign, int batchNumber) {
        MarketingCampaign fresh = campaignRepository.findById(campaign.getId()).orElse(null);
        if (fresh == null || fresh.getStatus() == MarketingCampaign.Status.CANCELLED) return;

        List<MarketingMailLog> batch = logRepository.findByCampaignAndBatchNumber(fresh, batchNumber);
        log.info("Marketing campaign '{}' — sending batch {}/{} ({} recipients)",
                fresh.getName(), batchNumber, fresh.getTotalBatches(), batch.size());

        String fromEmail = resolveFromEmail();
        String fromName  = siteConfigService.getConfigValueFresh("marketingFromName", appName);
        String replyTo   = resolveReplyTo();
        String physicalAddress = siteConfigService.getConfigValueFresh(
                "marketingFooterAddress",
                siteConfigService.getConfigValueFresh("CONTACT_ADDRESS", "Uyirgene International, Tamil Nadu, India"));
        String bccAddress = siteConfigService.getConfigValueFresh("emailBccAddress");
        JavaMailSender sender = resolveMailSender();

        boolean bccSent = false;
        for (MarketingMailLog entry : batch) {
            if (entry.getStatus() != MarketingMailLog.Status.PENDING) continue;
            try {
                String token    = ensureToken(entry.getUserId());
                String unsubUrl = baseUrl + "/unsubscribe?token=" + token;
                String html = buildMarketingHtml(
                        fresh.getHtmlBody(),
                        fresh.getName(),
                        unsubUrl,
                        physicalAddress
                );

                MimeMessage msg = sender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
                helper.setTo(entry.getEmail());
                helper.setFrom(new InternetAddress(fromEmail, fromName));
                if (replyTo != null) helper.setReplyTo(replyTo);
                helper.setSubject(fresh.getSubject());
                helper.setText(html, true);
                sender.send(msg);

                // Send one BCC copy on the first successful send of batch 1
                if (!bccSent && batchNumber == 1 && bccAddress != null && !bccAddress.isBlank()) {
                    try {
                        MimeMessage bccMsg = sender.createMimeMessage();
                        MimeMessageHelper bccHelper = new MimeMessageHelper(bccMsg, true, "UTF-8");
                        bccHelper.setTo(bccAddress);
                        bccHelper.setFrom(new InternetAddress(fromEmail, fromName));
                        bccHelper.setSubject("[Campaign Copy] " + fresh.getSubject());
                        bccHelper.setText(html, true);
                        sender.send(bccMsg);
                        bccSent = true;
                    } catch (Exception e) {
                        log.warn("Failed to send BCC copy for marketing campaign: {}", e.getMessage());
                    }
                }

                entry.setStatus(MarketingMailLog.Status.SENT);
                entry.setSentAt(LocalDateTime.now());
            } catch (Exception e) {
                log.warn("Marketing email failed for {}: {}", entry.getEmail(), e.getMessage());
                entry.setStatus(MarketingMailLog.Status.FAILED);
                entry.setErrorMessage(e.getMessage());
            }
            logRepository.save(entry);
        }

        fresh.setBatchesSent(fresh.getBatchesSent() + 1);
        if (fresh.getBatchesSent() >= fresh.getTotalBatches()) {
            fresh.setStatus(MarketingCampaign.Status.COMPLETED);
            fresh.setCompletedAt(LocalDateTime.now());
            log.info("Marketing campaign '{}' completed.", fresh.getName());
        }
        campaignRepository.save(fresh);
    }

    /**
     * Daily cron at 09:00 — sends next pending batch for any IN_PROGRESS campaign.
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void processDailyBatches() {
        campaignRepository.findFirstByStatusIn(List.of(MarketingCampaign.Status.IN_PROGRESS))
                .ifPresent(campaign -> {
                    if (campaign.getBatchesSent() < campaign.getTotalBatches()) {
                        int nextBatch = campaign.getBatchesSent() + 1;
                        log.info("Scheduled: sending batch {} for campaign '{}'", nextBatch, campaign.getName());
                        self.sendBatchAsync(campaign, nextBatch);
                    }
                });
    }

    @Transactional
    public MarketingCampaign cancelCampaign(Long id) {
        MarketingCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found: " + id));
        if (campaign.getStatus() == MarketingCampaign.Status.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed campaign.");
        }
        campaign.setStatus(MarketingCampaign.Status.CANCELLED);
        return campaignRepository.save(campaign);
    }

    public List<MarketingCampaign> getHistory() {
        return campaignRepository.findAllByOrderByCreatedAtDesc();
    }

    public MarketingCampaign getActiveCampaign() {
        return campaignRepository.findFirstByStatusIn(
                List.of(MarketingCampaign.Status.PENDING, MarketingCampaign.Status.IN_PROGRESS)
        ).orElse(null);
    }

    @Transactional
    public void unsubscribe(String token) {
        User user = userRepository.findByMarketingOptOutToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid unsubscribe token"));
        user.setMarketingOptOut(true);
        userRepository.save(user);
        log.info("User {} unsubscribed from marketing emails.", user.getEmail());
    }

    /** Returns the resolved marketing settings for frontend preview use. */
    public Map<String, String> getResolvedSettings() {
        String footerAddress = siteConfigService.getConfigValueFresh(
                "marketingFooterAddress",
                siteConfigService.getConfigValueFresh("CONTACT_ADDRESS", "Uyirgene International, Tamil Nadu, India"));
        String fromName = siteConfigService.getConfigValueFresh("marketingFromName", appName);
        return Map.of(
                "footerAddress", footerAddress,
                "fromName", fromName
        );
    }

    public long countOptedInUsers() {
        return userRepository.findByMarketingOptOutFalseOrMarketingOptOutIsNull().size();
    }

    /**
     * Resolve a reference code (course code or flagship program code) to its page URL.
     * Returns null if not found.
     */
    public Map<String, String> lookupReferenceCode(String code) {
        if (code == null || code.isBlank()) return null;
        String trimmed = code.trim();

        // Try course first
        return courseRepository.findByCourseCodeIgnoreCase(trimmed)
                .map(c -> Map.of(
                        "type", "course",
                        "name", c.getTitle() != null ? c.getTitle() : "",
                        "url", baseUrl + "/courses/" + c.getId()
                ))
                // Then flagship program
                .or(() -> flagshipProgramRepository.findByProgramCodeIgnoreCase(trimmed)
                        .map(p -> Map.of(
                                "type", "flagship",
                                "name", p.getTitle() != null ? p.getTitle() : "",
                                "url", baseUrl + "/flagship/" + p.getId()
                        )))
                .orElse(null);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Replaces all [[CTA:CODE|Label]] placeholders in the HTML body with
     * styled button HTML. Throws IllegalArgumentException if any code is not found.
     */
    private String resolveCtaPlaceholders(String htmlBody) {
        if (htmlBody == null || htmlBody.isBlank()) return htmlBody;

        Matcher matcher = CTA_PATTERN.matcher(htmlBody);
        StringBuffer result = new StringBuffer();

        while (matcher.find()) {
            String code  = matcher.group(1).trim();
            String label = matcher.group(2) != null ? matcher.group(2).trim() : "Learn More";

            String url = resolveCodeToUrl(code);
            if (url == null) {
                throw new IllegalArgumentException(
                        "No course or flagship program found with code: " + code);
            }

            String buttonHtml =
                    "<div style=\"text-align:center;padding:20px 0 8px;\">" +
                    "<a href=\"" + safe(url) + "\" " +
                    "style=\"display:inline-block;background:#1a237e;color:#ffffff;" +
                    "padding:14px 36px;border-radius:6px;text-decoration:none;" +
                    "font-size:15px;font-weight:700;letter-spacing:0.3px;\">" +
                    safe(label) +
                    "</a></div>";

            matcher.appendReplacement(result, Matcher.quoteReplacement(buttonHtml));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    private String resolveCodeToUrl(String code) {
        Map<String, String> resolved = lookupReferenceCode(code);
        return resolved != null ? resolved.get("url") : null;
    }

    /**
     * Returns a dedicated JavaMailSender for marketing emails when separate
     * SMTP credentials are configured (MARKETING_MAIL_USERNAME + MARKETING_MAIL_PASSWORD).
     * Falls back to the default injected mailSender when not configured.
     */
    private JavaMailSender resolveMailSender() {
        if (marketingMailUsername != null && !marketingMailUsername.isBlank()
                && marketingMailPassword != null && !marketingMailPassword.isBlank()) {
            JavaMailSenderImpl sender = new JavaMailSenderImpl();
            sender.setHost(marketingMailHost != null && !marketingMailHost.isBlank()
                    ? marketingMailHost : "smtp.gmail.com");
            sender.setPort(marketingMailPort > 0 ? marketingMailPort : 587);
            sender.setUsername(marketingMailUsername);
            sender.setPassword(marketingMailPassword);
            Properties props = sender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            return sender;
        }
        return mailSender; // fall back to default transactional sender
    }

    private String resolveFromEmail() {
        // 1. Explicitly configured marketing From address (SiteConfig) — read fresh, not cached
        String configured = siteConfigService.getConfigValueFresh("marketingFromEmail");
        if (configured != null && !configured.isBlank()) return configured;
        // 2. Marketing SMTP account address (when separate account is configured)
        if (marketingMailUsername != null && !marketingMailUsername.isBlank()) return marketingMailUsername;
        // 3. Default transactional from
        if (mailFrom != null && !mailFrom.isBlank()) return mailFrom;
        if (mailUsername != null && !mailUsername.isBlank()) return mailUsername;
        return "noreply@uyirgene.com";
    }

    /**
     * Reply-To is set to marketingFromEmail when configured.
     * Useful with Gmail SMTP which forces From to the authenticated account —
     * replies will still go to the configured marketing address.
     */
    private String resolveReplyTo() {
        String configured = siteConfigService.getConfigValueFresh("marketingFromEmail");
        return (configured != null && !configured.isBlank()) ? configured : null;
    }

    private String ensureToken(Long userId) {
        return userRepository.findById(userId).map(u -> {
            if (u.getMarketingOptOutToken() == null || u.getMarketingOptOutToken().isBlank()) {
                String t = generateToken();
                u.setMarketingOptOutToken(t);
                userRepository.save(u);
                return t;
            }
            return u.getMarketingOptOutToken();
        }).orElse("unknown");
    }

    private String generateToken() {
        return UUID.randomUUID().toString().replace("-", "") +
               UUID.randomUUID().toString().replace("-", "");
    }

    private String buildMarketingHtml(String messageContent, String campaignName,
                                       String unsubscribeUrl, String physicalAddress) {
        return """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%s</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">UyirGene — Professional Food Safety &amp; Quality Training</div>
<table width="100%%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4">
<tr><td align="center" style="padding:20px 10px;">
<table width="600" cellpadding="0" cellspacing="0" border="0"
       style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <tr>
    <td style="background:linear-gradient(135deg,#1a237e 0%%,#283593 100%%);padding:32px 40px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">UyirGene</h1>
      <p style="margin:6px 0 0;color:#c5cae9;font-size:13px;">Professional Food Safety &amp; Quality Training</p>
    </td>
  </tr>
  <tr>
    <td style="padding:36px 40px 24px;">%s</td>
  </tr>
  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e0e0e0;margin:0;"></td></tr>
  <tr>
    <td style="padding:24px 40px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;color:#757575;">You received this email because you registered on UyirGene.</p>
      <p style="margin:0 0 8px;font-size:12px;color:#757575;">%s</p>
      <p style="margin:0;font-size:12px;color:#757575;">
        <a href="%s" style="color:#1a237e;text-decoration:underline;">Unsubscribe</a> from marketing emails
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>
""".formatted(
                safe(campaignName),
                messageContent != null ? messageContent : "",
                safe(physicalAddress),
                safe(unsubscribeUrl)
        );
    }

    /**
     * Converts admin-entered plain text to safe HTML:
     * - Escapes &, <, >, " to prevent any accidental HTML injection
     * - Converts line breaks to <br> tags
     * [[CTA:...]] markers are unaffected (no HTML special chars) and resolved afterwards.
     */
    private String plainTextToHtml(String text) {
        if (text == null) return "";
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("\r\n", "<br>")
                .replace("\n", "<br>")
                .replace("\r", "<br>");
    }

    private String safe(String s) {
        return s != null ? s : "";
    }
}
