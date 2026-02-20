package com.uyirgene.course;

import com.uyirgene.blog.Blog;
import com.uyirgene.blog.BlogSubscription;
import com.uyirgene.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {
    private final JavaMailSender mailSender;
    private final MailTemplateService mailTemplateService;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.mail.from:}")
    private String mailFrom;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.name:UyirGene}")
    private String appName;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");

    /**
     * Send enrollment success email
     */
    @Async
    public void sendEnrollmentSuccess(User user, Course course) {
        try {
            log.info("Sending enrollment success email for course: {}", course.getTitle());
            MailTemplate tpl = mailTemplateService.findByKey("enrollment-success").orElse(null);
            String subject = tpl != null
                    ? applyVars(tpl.getSubject(), Map.of("courseTitle", safe(course.getTitle())))
                    : "Welcome! You're enrolled in: " + safe(course.getTitle());
            String content = (tpl != null && tpl.getContent() != null && !tpl.getContent().isBlank())
                    ? tpl.getContent()
                    : "Congratulations! You have successfully enrolled in your new course. You can start learning right away by clicking the button below.";
            String baseHtml = (tpl != null && tpl.getHtmlBody() != null && !tpl.getHtmlBody().isBlank())
                    ? tpl.getHtmlBody()
                    : loadTemplate("enrollment-success.html");

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(user.getEmail());
            setFrom(helper);
            helper.setSubject(subject);
            helper.setText(buildEnrollmentHtml(user, course, content, baseHtml), true);
            mailSender.send(msg);
            log.info("Enrollment success email sent successfully for course: {}", course.getTitle());
        } catch (Exception e) {
            log.error("Failed to send enrollment success email for course {}: {}", course.getTitle(), e.getMessage(), e);
        }
    }

    /**
     * Send course completion email
     */
    @Async
    public void sendCourseCompletion(User user, Course course, Double marks, String certificateType) {
        try {
            log.info("Sending course completion email for course: {}", course.getTitle());
            MailTemplate tpl = mailTemplateService.findByKey("course-completion").orElse(null);
            String subject = tpl != null
                    ? applyVars(tpl.getSubject(), Map.of("courseTitle", safe(course.getTitle())))
                    : "Congratulations! You've completed: " + safe(course.getTitle());
            String content = (tpl != null && tpl.getContent() != null && !tpl.getContent().isBlank())
                    ? tpl.getContent()
                    : "Excellent work! You have successfully completed your course. Your dedication and hard work have paid off!";
            String baseHtml = (tpl != null && tpl.getHtmlBody() != null && !tpl.getHtmlBody().isBlank())
                    ? tpl.getHtmlBody()
                    : loadTemplate("course-completion.html");

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(user.getEmail());
            setFrom(helper);
            helper.setSubject(subject);
            helper.setText(buildCompletionHtml(user, course, marks, certificateType, content, baseHtml), true);
            mailSender.send(msg);
            log.info("Course completion email sent successfully for course: {}", course.getTitle());
        } catch (Exception e) {
            log.error("Failed to send course completion email for course {}: {}", course.getTitle(), e.getMessage(), e);
        }
    }

    /**
     * Send combined results-published + certificate-ready notification.
     * Certificate is included when provided (it should always be generated before publishing).
     */
    @Async
    public void sendResultPublished(User user, Course course, Enrollment enrollment, Certificate certificate) {
        try {
            log.info("Sending results & certificate email for course: {}", course.getTitle());
            MailTemplate tpl = mailTemplateService.findByKey("result-published").orElse(null);
            String subject = tpl != null
                    ? applyVars(tpl.getSubject(), Map.of("courseTitle", safe(course.getTitle())))
                    : "Your Results are Published & Certificate is Ready: " + safe(course.getTitle());
            String content = (tpl != null && tpl.getContent() != null && !tpl.getContent().isBlank())
                    ? tpl.getContent()
                    : "Great news! Your results have been published and your certificate is ready for download. Click the button below to view your score and download your certificate.";
            String baseHtml = (tpl != null && tpl.getHtmlBody() != null && !tpl.getHtmlBody().isBlank())
                    ? tpl.getHtmlBody()
                    : loadTemplate("result-published.html");

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(user.getEmail());
            setFrom(helper);
            helper.setSubject(subject);
            helper.setText(buildResultPublishedHtml(user, course, enrollment, certificate, content, baseHtml), true);
            mailSender.send(msg);
            log.info("Results & certificate email sent successfully for course: {}", course.getTitle());
        } catch (Exception e) {
            log.error("Failed to send results & certificate email for course {}: {}", course.getTitle(), e.getMessage(), e);
        }
    }

    /**
     * Send payment failure notification email
     */
    @Async
    public void sendPaymentFailed(String userEmail, String userName, String courseTitle, String reason, String retryUrl) {
        try {
            log.info("Sending payment failed email to {} for: {}", userEmail, courseTitle);
            MailTemplate tpl = mailTemplateService.findByKey("payment-failed").orElse(null);
            String subject = tpl != null
                    ? applyVars(tpl.getSubject(), Map.of("courseTitle", safe(courseTitle)))
                    : "Payment Failed: " + safe(courseTitle);
            String content = (tpl != null && tpl.getContent() != null && !tpl.getContent().isBlank())
                    ? tpl.getContent()
                    : "We're sorry, your payment could not be processed. Please try again using the button below.";
            String baseHtml = (tpl != null && tpl.getHtmlBody() != null && !tpl.getHtmlBody().isBlank())
                    ? tpl.getHtmlBody()
                    : loadTemplate("payment-failed.html");

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(userEmail);
            setFrom(helper);
            helper.setSubject(subject);
            helper.setText(buildPaymentFailedHtml(userName != null ? userName : userEmail, courseTitle, reason, retryUrl, content, baseHtml), true);
            mailSender.send(msg);
            log.info("Payment failed email sent to {}", userEmail);
        } catch (Exception e) {
            log.error("Failed to send payment failure email to {}: {}", userEmail, e.getMessage(), e);
        }
    }

    /**
     * Send new blog notification to subscribers
     */
    @Async
    public void sendNewBlogNotification(List<BlogSubscription> subscribers, Blog blog) {
        log.info("Sending new blog notification to {} subscribers for blog: {}", subscribers.size(), blog.getTitle());

        for (BlogSubscription subscriber : subscribers) {
            try {
                MimeMessage msg = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
                helper.setTo(subscriber.getEmail());
                setFrom(helper);
                helper.setSubject("New Post: " + blog.getTitle());

                String html = buildNewBlogHtml(subscriber, blog);
                helper.setText(html, true);

                mailSender.send(msg);
                log.debug("Blog notification sent for blog: {}", blog.getTitle());
            } catch (Exception e) {
                log.error("Failed to send blog notification for blog {}: {}", blog.getTitle(), e.getMessage());
            }
        }

        log.info("Finished sending blog notifications for: {}", blog.getTitle());
    }

    /**
     * Send new blog notification to a single subscriber
     */
    @Async
    public void sendNewBlogNotification(BlogSubscription subscriber, Blog blog) {
        try {
            log.info("Sending new blog notification for blog: {}", blog.getTitle());
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(subscriber.getEmail());
            setFrom(helper);
            helper.setSubject("New Post: " + blog.getTitle());

            String html = buildNewBlogHtml(subscriber, blog);
            helper.setText(html, true);

            mailSender.send(msg);
            log.info("Blog notification sent successfully for blog: {}", blog.getTitle());
        } catch (Exception e) {
            log.error("Failed to send blog notification for blog {}: {}", blog.getTitle(), e.getMessage(), e);
        }
    }

    /**
     * Send bundle enrollment success email
     */
    @Async
    public void sendBundleEnrollmentSuccess(String userEmail, String userName, String bundleTitle, List<String> courseTitles) {
        try {
            log.info("Sending bundle enrollment success email to {} for bundle: {}", userEmail, bundleTitle);
            MailTemplate tpl = mailTemplateService.findByKey("bundle-enrollment-success").orElse(null);
            String subject = tpl != null
                    ? applyVars(tpl.getSubject(), Map.of("bundleTitle", safe(bundleTitle)))
                    : "Welcome! You're enrolled in the bundle: " + safe(bundleTitle);
            String content = (tpl != null && tpl.getContent() != null && !tpl.getContent().isBlank())
                    ? tpl.getContent()
                    : "Congratulations! You have successfully enrolled in the course bundle. You now have access to all included courses and can start learning right away.";
            String baseHtml = (tpl != null && tpl.getHtmlBody() != null && !tpl.getHtmlBody().isBlank())
                    ? tpl.getHtmlBody()
                    : loadTemplate("bundle-enrollment-success.html");

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(userEmail);
            setFrom(helper);
            helper.setSubject(subject);
            helper.setText(buildBundleEnrollmentHtml(userEmail, userName, bundleTitle, courseTitles, content, baseHtml), true);
            mailSender.send(msg);
            log.info("Bundle enrollment success email sent successfully to {} for bundle: {}", userEmail, bundleTitle);
        } catch (Exception e) {
            log.error("Failed to send bundle enrollment email to {} for bundle {}: {}", userEmail, bundleTitle, e.getMessage(), e);
        }
    }

    private String getFromEmail() {
        if (mailFrom != null && !mailFrom.isBlank()) return mailFrom;
        if (mailUsername != null && !mailUsername.isBlank()) return mailUsername;
        return "noreply@uyirgene.com";
    }

    private void setFrom(MimeMessageHelper helper) throws Exception {
        helper.setFrom(getFromEmail(), appName);
    }

    private String safe(String val) {
        return val != null ? val : "";
    }

    private String applyVars(String text, Map<String, String> vars) {
        if (text == null) return "";
        for (Map.Entry<String, String> e : vars.entrySet()) {
            text = text.replace("{{" + e.getKey() + "}}", e.getValue() != null ? e.getValue() : "");
        }
        return text;
    }

    private String loadTemplate(String templateName) {
        try {
            var res = new ClassPathResource("templates/" + templateName);
            try (InputStream is = res.getInputStream()) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.warn("Failed to load email template {}: {}", templateName, e.getMessage());
            return null;
        }
    }

    private String buildEnrollmentHtml(User user, Course course, String content, String baseHtml) {
        String tpl = baseHtml != null ? baseHtml : loadTemplate("enrollment-success.html");
        if (tpl == null) {
            return buildFallbackEnrollmentHtml(user, course);
        }
        tpl = tpl.replace("{{name}}", user.getName() == null ? user.getEmail() : user.getName());
        tpl = tpl.replace("{{courseTitle}}", course.getTitle() == null ? "" : course.getTitle());
        tpl = tpl.replace("{{courseDescription}}", course.getShortDescription() != null ? course.getShortDescription() :
                (course.getDescription() == null ? "" : truncate(course.getDescription(), 200)));
        tpl = tpl.replace("{{courseCode}}", course.getCourseCode() != null ? course.getCourseCode() : "");
        tpl = tpl.replace("{{trainerName}}", course.getTrainerName() != null ? course.getTrainerName() : "");
        tpl = tpl.replace("{{courseUrl}}", baseUrl + "/courses/" + course.getId());
        tpl = tpl.replace("{{appName}}", appName);
        tpl = tpl.replace("{{content}}", content != null ? content : "");
        return tpl;
    }

    private String buildCompletionHtml(User user, Course course, Double marks, String certificateType, String content, String baseHtml) {
        String tpl = baseHtml != null ? baseHtml : loadTemplate("course-completion.html");
        if (tpl == null) {
            return buildFallbackCompletionHtml(user, course, marks, certificateType);
        }
        tpl = tpl.replace("{{name}}", user.getName() == null ? user.getEmail() : user.getName());
        tpl = tpl.replace("{{courseTitle}}", course.getTitle() == null ? "" : course.getTitle());
        tpl = tpl.replace("{{courseCode}}", course.getCourseCode() != null ? course.getCourseCode() : "");
        tpl = tpl.replace("{{marks}}", marks != null ? String.format("%.1f%%", marks) : "N/A");
        tpl = tpl.replace("{{certificateType}}", certificateType != null ? certificateType : "COMPLETION");
        tpl = tpl.replace("{{dashboardUrl}}", baseUrl + "/my-courses");
        tpl = tpl.replace("{{appName}}", appName);
        tpl = tpl.replace("{{content}}", content != null ? content : "");
        return tpl;
    }

    private String buildResultPublishedHtml(User user, Course course, Enrollment enrollment, Certificate certificate, String content, String baseHtml) {
        String tpl = baseHtml != null ? baseHtml : loadTemplate("result-published.html");
        if (tpl == null) {
            return buildFallbackResultPublishedHtml(user, course, enrollment);
        }
        tpl = tpl.replace("{{name}}", user.getName() == null ? user.getEmail() : user.getName());
        tpl = tpl.replace("{{courseTitle}}", course.getTitle() == null ? "" : course.getTitle());
        tpl = tpl.replace("{{courseCode}}", course.getCourseCode() != null ? course.getCourseCode() : "");
        tpl = tpl.replace("{{marks}}", enrollment.getMarks() != null ? String.format("%.1f%%", enrollment.getMarks()) : "N/A");
        tpl = tpl.replace("{{certificateType}}", enrollment.getCertificateType() != null ? enrollment.getCertificateType().name() : "");
        // Certificate fields — populated if certificate was generated before publishing
        tpl = tpl.replace("{{certificateId}}", certificate != null ? certificate.getCertificateId() : "");
        tpl = tpl.replace("{{issuedDate}}", (certificate != null && certificate.getIssuedAt() != null) ? certificate.getIssuedAt().format(DATE_FORMATTER) : "");
        tpl = tpl.replace("{{verifyUrl}}", certificate != null ? baseUrl + "/certificate/" + certificate.getCertificateId() : baseUrl + "/my-courses");
        tpl = tpl.replace("{{dashboardUrl}}", baseUrl + "/my-courses");
        tpl = tpl.replace("{{appName}}", appName);
        tpl = tpl.replace("{{content}}", content != null ? content : "");
        return tpl;
    }

    private String buildBundleEnrollmentHtml(String userEmail, String userName, String bundleTitle, List<String> courseTitles, String content, String baseHtml) {
        String tpl = baseHtml != null ? baseHtml : loadTemplate("bundle-enrollment-success.html");
        if (tpl == null) {
            return buildFallbackBundleEnrollmentHtml(userEmail, userName, bundleTitle, courseTitles);
        }
        String displayName = (userName != null && !userName.isBlank()) ? userName : userEmail;
        String courseListHtml = "<ul style=\"list-style: none; padding: 0; margin: 0;\">"
                + courseTitles.stream()
                    .map(t -> "<li style=\"padding: 8px 0; border-bottom: 1px solid #e0d0f0; color: #333;\">&#10003;&nbsp;<strong>" + t + "</strong></li>")
                    .collect(java.util.stream.Collectors.joining("\n"))
                + "</ul>";
        tpl = tpl.replace("{{name}}", displayName);
        tpl = tpl.replace("{{bundleTitle}}", bundleTitle != null ? bundleTitle : "");
        tpl = tpl.replace("{{courseList}}", courseListHtml);
        tpl = tpl.replace("{{dashboardUrl}}", baseUrl + "/my-courses");
        tpl = tpl.replace("{{appName}}", appName);
        tpl = tpl.replace("{{content}}", content != null ? content : "");
        return tpl;
    }

    private String buildPaymentFailedHtml(String name, String courseTitle, String reason, String retryUrl, String content, String baseHtml) {
        String tpl = baseHtml != null ? baseHtml : loadTemplate("payment-failed.html");
        if (tpl == null) {
            return String.format("""
                <html><body style="font-family:Arial,sans-serif;color:#333;">
                <h2 style="color:#c0392b;">Payment Failed</h2>
                <p>Hi %s,</p>
                <p>%s</p>
                <p><strong>Course:</strong> %s</p>
                <p><strong>Reason:</strong> %s</p>
                <p>If any amount was deducted, it will be automatically refunded within 5–7 business days. If you do not receive a refund, please contact your bank with the transaction details.</p>
                <p><a href="%s" style="background:#e74c3c;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Try Again</a></p>
                <p>The %s Team</p>
                </body></html>
                """, name, content, safe(courseTitle), safe(reason), safe(retryUrl), appName);
        }
        String reasonLine = (reason != null && !reason.isBlank())
                ? "<p style=\"color:#721c24;margin:0;font-size:14px;\"><strong>Reason:</strong> " + reason + "</p>"
                : "";
        tpl = tpl.replace("{{name}}", safe(name));
        tpl = tpl.replace("{{courseTitle}}", safe(courseTitle));
        tpl = tpl.replace("{{reasonLine}}", reasonLine);
        tpl = tpl.replace("{{retryUrl}}", safe(retryUrl));
        tpl = tpl.replace("{{content}}", content != null ? content : "");
        tpl = tpl.replace("{{appName}}", appName);
        return tpl;
    }

    private String buildNewBlogHtml(BlogSubscription subscriber, Blog blog) {
        String tpl = loadTemplate("new-blog-notification.html");
        if (tpl == null) {
            return buildFallbackNewBlogHtml(subscriber, blog);
        }
        tpl = tpl.replace("{{name}}", subscriber.getName() != null ? subscriber.getName() : "Subscriber");
        tpl = tpl.replace("{{blogTitle}}", blog.getTitle() != null ? blog.getTitle() : "");
        tpl = tpl.replace("{{blogDescription}}", blog.getShortDescription() != null ? blog.getShortDescription() :
                (blog.getContent() != null ? truncate(blog.getContent(), 200) : ""));
        tpl = tpl.replace("{{category}}", blog.getCategory() != null ? blog.getCategory() : "General");
        tpl = tpl.replace("{{authorName}}", blog.getAuthorName() != null ? blog.getAuthorName() : "Editorial Team");
        tpl = tpl.replace("{{readingTime}}", blog.getReadingTimeMinutes() != null ? String.valueOf(blog.getReadingTimeMinutes()) : "5");
        tpl = tpl.replace("{{blogUrl}}", baseUrl + "/blog/" + (blog.getUrlSlug() != null ? blog.getUrlSlug() : blog.getId()));
        tpl = tpl.replace("{{unsubscribeUrl}}", baseUrl + "/blog/unsubscribe/" + subscriber.getUnsubscribeToken());
        tpl = tpl.replace("{{appName}}", appName);
        return tpl;
    }

    // Fallback HTML builders when templates are not found
    private String buildFallbackEnrollmentHtml(User user, Course course) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2980B9;">Welcome to %s!</h2>
                <p>Hi %s,</p>
                <p>You have successfully enrolled in <strong>%s</strong>.</p>
                <p>You can start learning right away by visiting your dashboard.</p>
                <p><a href="%s" style="background-color: #2980B9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Course</a></p>
                <p>Happy learning!</p>
                <p>Best regards,<br>The %s Team</p>
            </body>
            </html>
            """, appName, user.getName() != null ? user.getName() : user.getEmail(),
            course.getTitle(), baseUrl + "/courses/" + course.getId(), appName);
    }

    private String buildFallbackCompletionHtml(User user, Course course, Double marks, String certificateType) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #27AE60;">Congratulations!</h2>
                <p>Hi %s,</p>
                <p>You have successfully completed <strong>%s</strong>!</p>
                <p>Your certificate will be available for download once the results are published.</p>
                <p><a href="%s" style="background-color: #27AE60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Courses</a></p>
                <p>Keep up the great work!</p>
                <p>Best regards,<br>The %s Team</p>
            </body>
            </html>
            """, user.getName() != null ? user.getName() : user.getEmail(),
            course.getTitle(), baseUrl + "/my-courses", appName);
    }

    private String buildFallbackBundleEnrollmentHtml(String userEmail, String userName, String bundleTitle, List<String> courseTitles) {
        String displayName = (userName != null && !userName.isBlank()) ? userName : userEmail;
        String courseList = courseTitles.stream()
                .map(t -> "<li><strong>" + t + "</strong></li>")
                .collect(java.util.stream.Collectors.joining("\n"));
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #8E44AD;">Welcome to %s!</h2>
                <p>Hi %s,</p>
                <p>You have successfully enrolled in the <strong>%s</strong> bundle!</p>
                <p>You now have access to the following courses:</p>
                <ul>%s</ul>
                <p><a href="%s" style="background-color: #8E44AD; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to My Courses</a></p>
                <p>Happy learning!<br>The %s Team</p>
            </body>
            </html>
            """, appName, displayName, bundleTitle, courseList, baseUrl + "/my-courses", appName);
    }

    private String buildFallbackResultPublishedHtml(User user, Course course, Enrollment enrollment) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #27AE60;">Results &amp; Certificate Ready!</h2>
                <p>Hi %s,</p>
                <p>The results for <strong>%s</strong> have been published and your certificate is ready for download.</p>
                <p><a href="%s" style="background-color: #27AE60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Results &amp; Download Certificate</a></p>
                <p>Best regards,<br>The %s Team</p>
            </body>
            </html>
            """, user.getName() != null ? user.getName() : user.getEmail(),
            course.getTitle(), baseUrl + "/my-courses", appName);
    }

    private String buildFallbackNewBlogHtml(BlogSubscription subscriber, Blog blog) {
        String blogUrl = baseUrl + "/blog/" + (blog.getUrlSlug() != null ? blog.getUrlSlug() : blog.getId());
        String unsubscribeUrl = baseUrl + "/blog/unsubscribe/" + subscriber.getUnsubscribeToken();
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #8E44AD;">New Blog Post!</h2>
                <p>Hi %s,</p>
                <p>We've just published a new article that we think you'll enjoy!</p>
                <h3 style="color: #8E44AD;">%s</h3>
                <p>%s</p>
                <p><strong>Category:</strong> %s | <strong>Author:</strong> %s</p>
                <p><a href="%s" style="background-color: #8E44AD; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Read Article</a></p>
                <p style="font-size: 12px; color: #999; margin-top: 30px;">
                    You're receiving this because you subscribed to our blog.<br>
                    <a href="%s" style="color: #8E44AD;">Unsubscribe</a>
                </p>
                <p>Best regards,<br>The %s Team</p>
            </body>
            </html>
            """,
            subscriber.getName() != null ? subscriber.getName() : "Subscriber",
            blog.getTitle(),
            blog.getShortDescription() != null ? blog.getShortDescription() : truncate(blog.getContent(), 200),
            blog.getCategory() != null ? blog.getCategory() : "General",
            blog.getAuthorName() != null ? blog.getAuthorName() : "Editorial Team",
            blogUrl,
            unsubscribeUrl,
            appName);
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    }
}
