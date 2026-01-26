package com.uyirgene.course;

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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

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
            log.info("Sending enrollment success email to {} for course: {}", user.getEmail(), course.getTitle());
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setFrom(getFromAddress());
            helper.setSubject("Welcome! You're enrolled in: " + course.getTitle());

            String html = buildEnrollmentHtml(user, course);
            helper.setText(html, true);

            mailSender.send(msg);
            log.info("Enrollment success email sent successfully to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send enrollment success email to {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }

    /**
     * Send course completion email
     */
    @Async
    public void sendCourseCompletion(User user, Course course, Double marks, String certificateType) {
        try {
            log.info("Sending course completion email to {} for course: {}", user.getEmail(), course.getTitle());
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setFrom(getFromAddress());
            helper.setSubject("Congratulations! You've completed: " + course.getTitle());

            String html =
                    buildCompletionHtml(user, course, marks, certificateType);
            helper.setText(html, true);

            mailSender.send(msg);
            log.info("Course completion email sent successfully to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send course completion email to {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }

    /**
     * Send certificate ready notification
     */
    @Async
    public void sendCertificateReady(User user, Course course, Certificate certificate) {
        try {
            log.info("Sending certificate ready email to {} for course: {}", user.getEmail(), course.getTitle());
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setFrom(getFromAddress());
            helper.setSubject("Your Certificate is Ready: " + course.getTitle());

            String html = buildCertificateHtml(user, course, certificate);
            helper.setText(html, true);

            mailSender.send(msg);
            log.info("Certificate ready email sent successfully to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send certificate ready email to {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }

    /**
     * Send result published notification
     */
    @Async
    public void sendResultPublished(User user, Course course, Enrollment enrollment) {
        try {
            log.info("Sending result published email to {} for course: {}", user.getEmail(), course.getTitle());
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setFrom(getFromAddress());
            helper.setSubject("Your Results are Published: " + course.getTitle());

            String html = buildResultPublishedHtml(user, course, enrollment);
            helper.setText(html, true);

            mailSender.send(msg);
            log.info("Result published email sent successfully to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send result published email to {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }

    private String getFromAddress() {
        return (from == null || from.isBlank()) ? "noreply@uyirgene.com" : from;
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

    private String buildEnrollmentHtml(User user, Course course) {
        String tpl = loadTemplate("enrollment-success.html");
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
        return tpl;
    }

    private String buildCompletionHtml(User user, Course course, Double marks, String certificateType) {
        String tpl = loadTemplate("course-completion.html");
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
        return tpl;
    }

    private String buildCertificateHtml(User user, Course course, Certificate certificate) {
        String tpl = loadTemplate("certificate-ready.html");
        if (tpl == null) {
            return buildFallbackCertificateHtml(user, course, certificate);
        }
        tpl = tpl.replace("{{name}}", user.getName() == null ? user.getEmail() : user.getName());
        tpl = tpl.replace("{{courseTitle}}", course.getTitle() == null ? "" : course.getTitle());
        tpl = tpl.replace("{{courseCode}}", course.getCourseCode() != null ? course.getCourseCode() : "");
        tpl = tpl.replace("{{certificateId}}", certificate.getCertificateId());
        tpl = tpl.replace("{{certificateType}}", certificate.getType() != null ? certificate.getType().name() : "COMPLETION");
        tpl = tpl.replace("{{issuedDate}}", certificate.getIssuedAt() != null ? certificate.getIssuedAt().format(DATE_FORMATTER) : "");
        tpl = tpl.replace("{{downloadUrl}}", baseUrl + "/my-courses");
        tpl = tpl.replace("{{verifyUrl}}", baseUrl + "/certificate/" + certificate.getCertificateId());
        tpl = tpl.replace("{{appName}}", appName);
        return tpl;
    }

    private String buildResultPublishedHtml(User user, Course course, Enrollment enrollment) {
        String tpl = loadTemplate("result-published.html");
        if (tpl == null) {
            return buildFallbackResultPublishedHtml(user, course, enrollment);
        }
        tpl = tpl.replace("{{name}}", user.getName() == null ? user.getEmail() : user.getName());
        tpl = tpl.replace("{{courseTitle}}", course.getTitle() == null ? "" : course.getTitle());
        tpl = tpl.replace("{{courseCode}}", course.getCourseCode() != null ? course.getCourseCode() : "");
        tpl = tpl.replace("{{marks}}", enrollment.getMarks() != null ? String.format("%.1f%%", enrollment.getMarks()) : "N/A");
        tpl = tpl.replace("{{certificateType}}", enrollment.getCertificateType() != null ? enrollment.getCertificateType().name() : "");
        tpl = tpl.replace("{{dashboardUrl}}", baseUrl + "/my-courses");
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
        String marksText = marks != null ? String.format("Your score: %.1f%%", marks) : "";
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #27AE60;">Congratulations!</h2>
                <p>Hi %s,</p>
                <p>You have successfully completed <strong>%s</strong>!</p>
                %s
                <p>Your certificate will be available for download once the results are published.</p>
                <p><a href="%s" style="background-color: #27AE60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Courses</a></p>
                <p>Keep up the great work!</p>
                <p>Best regards,<br>The %s Team</p>
            </body>
            </html>
            """, user.getName() != null ? user.getName() : user.getEmail(),
            course.getTitle(), marksText.isEmpty() ? "" : "<p>" + marksText + "</p>",
            baseUrl + "/my-courses", appName);
    }

    private String buildFallbackCertificateHtml(User user, Course course, Certificate certificate) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #8E44AD;">Your Certificate is Ready!</h2>
                <p>Hi %s,</p>
                <p>Congratulations! Your certificate for <strong>%s</strong> is now ready for download.</p>
                <p><strong>Certificate ID:</strong> %s</p>
                <p><strong>Certificate Type:</strong> %s</p>
                <p><strong>Issue Date:</strong> %s</p>
                <p><a href="%s" style="background-color: #8E44AD; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Certificate</a></p>
                <p>You can also verify your certificate anytime at: <a href="%s">%s</a></p>
                <p>Best regards,<br>The %s Team</p>
            </body>
            </html>
            """, user.getName() != null ? user.getName() : user.getEmail(),
            course.getTitle(), certificate.getCertificateId(),
            certificate.getType() != null ? certificate.getType().name() : "COMPLETION",
            certificate.getIssuedAt() != null ? certificate.getIssuedAt().format(DATE_FORMATTER) : "",
            baseUrl + "/my-courses",
            baseUrl + "/certificate/" + certificate.getCertificateId(),
            baseUrl + "/certificate/" + certificate.getCertificateId(),
            appName);
    }

    private String buildFallbackResultPublishedHtml(User user, Course course, Enrollment enrollment) {
        String marksText = enrollment.getMarks() != null ? String.format("%.1f%%", enrollment.getMarks()) : "N/A";
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #E74C3C;">Your Results are Published!</h2>
                <p>Hi %s,</p>
                <p>The results for <strong>%s</strong> have been published.</p>
                <p><strong>Your Score:</strong> %s</p>
                <p>Visit your dashboard to view your certificate and download it.</p>
                <p><a href="%s" style="background-color: #E74C3C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Results</a></p>
                <p>Best regards,<br>The %s Team</p>
            </body>
            </html>
            """, user.getName() != null ? user.getName() : user.getEmail(),
            course.getTitle(), marksText, baseUrl + "/my-courses", appName);
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    }
}
