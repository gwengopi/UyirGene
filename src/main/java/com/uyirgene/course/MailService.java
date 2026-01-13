package com.uyirgene.course;

import com.uyirgene.course.Course;
import com.uyirgene.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    public void sendEnrollmentSuccess(User user, Course course) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setFrom(from == null || from.isBlank() ? "noreply@uyirgene.local" : from);
            helper.setSubject("Enrollment successful: " + course.getTitle());

            String html = buildHtml(user, course);
            helper.setText(html, true);

            mailSender.send(msg);
        } catch (Exception e) {
            // Log - but don't fail the request
            e.printStackTrace();
        }
    }

    private String buildHtml(User user, Course course) {
        String tpl = "<html><body>" +
                "<h2>Enrollment successful</h2>" +
                "<p>Hi %s,</p>" +
                "<p>You're successfully enrolled in <strong>%s</strong>.</p>" +
                "<p>Course details:</p>" +
                "<ul>" +
                "<li>Title: %s</li>" +
                "<li>Description: %s</li>" +
                "</ul>" +
                "<p>Happy learning!</p>" +
                "</body></html>";
        return String.format(tpl, user.getName(), course.getTitle(), course.getTitle(), course.getDescription() == null ? "" : course.getDescription());
    }
}
