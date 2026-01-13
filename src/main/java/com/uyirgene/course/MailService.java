package com.uyirgene.course;

import com.uyirgene.course.Course;
import com.uyirgene.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    public void sendEnrollmentSuccess(User user, Course course) {
        try {
            log.info("Sending enrollment success email to {} for course: {}", user.getEmail(), course.getTitle());
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setFrom(from == null || from.isBlank() ? "noreply@uyirgene.local" : from);
            helper.setSubject("Enrollment successful: " + course.getTitle());

            String html = buildHtml(user, course);
            helper.setText(html, true);

            mailSender.send(msg);
            log.info("Enrollment success email sent successfully to {}", user.getEmail());
        } catch (Exception e) {
            // Log error but don't fail the enrollment request
            log.error("Failed to send enrollment success email to {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }

    private String buildHtml(User user, Course course) {
        try {
            var res = new ClassPathResource("templates/enrollment-success.html");
            String tpl;
            try (InputStream is = res.getInputStream()) {
                tpl = new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            }
            tpl = tpl.replace("{{name}}", user.getName() == null ? user.getEmail() : user.getName());
            tpl = tpl.replace("{{courseTitle}}", course.getTitle() == null ? "" : course.getTitle());
            tpl = tpl.replace("{{courseDescription}}", course.getDescription() == null ? "" : course.getDescription());
            return tpl;
        } catch (Exception e) {
            log.warn("Failed to load email template, using fallback: {}", e.getMessage());
            return "Hi " + (user.getName() == null ? user.getEmail() : user.getName()) + ", you are enrolled in " + course.getTitle();
        }
    }
}
