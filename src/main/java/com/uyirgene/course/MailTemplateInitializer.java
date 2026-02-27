package com.uyirgene.course;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * On startup, stores the HTML body of each mail template into the DB (html_body column).
 * This ensures MailService always reads from DB rather than the classpath, avoiding
 * stale-class issues when classpath files haven't been rebuilt yet.
 * Only populates if html_body is currently null/blank (idempotent).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MailTemplateInitializer implements ApplicationRunner {

    private final MailTemplateService mailTemplateService;

    private static final String[][] TEMPLATES = {
        {"enrollment-success",        "enrollment-success.html"},
        {"course-completion",         "course-completion.html"},
        {"result-published",          "result-published.html"},
        {"bundle-enrollment-success", "bundle-enrollment-success.html"},
        {"payment-failed",            "payment-failed.html"},
        {"course-reminder",           "course-reminder.html"},
    };

    @Override
    public void run(ApplicationArguments args) {
        for (String[] entry : TEMPLATES) {
            String key      = entry[0];
            String fileName = entry[1];
            try {
                ClassPathResource res = new ClassPathResource("templates/" + fileName);
                try (InputStream is = res.getInputStream()) {
                    String html = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                    mailTemplateService.initHtmlBody(key, html);
                    log.info("Mail template html_body initialized for key: {}", key);
                }
            } catch (Exception e) {
                log.warn("Could not initialize html_body for mail template '{}': {}", key, e.getMessage());
            }
        }
    }
}
