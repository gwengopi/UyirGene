package com.uyirgene.contact;

import com.uyirgene.config.SiteConfigService;
import com.uyirgene.course.MailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Slf4j
public class ContactController {

    private final MailService mailService;
    private final SiteConfigService siteConfigService;

    @PostMapping("/submit")
    public ResponseEntity<Void> submit(@Valid @RequestBody ContactRequest req) {
        String adminEmail = siteConfigService.getConfigValueFresh("CONTACT_EMAIL", "info@uyirgene.com");
        mailService.sendContactFormToAdmin(adminEmail, req.name(), req.email(), req.subject(), req.message());
        return ResponseEntity.ok().build();
    }

    record ContactRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Email is required") @Email(message = "Enter a valid email") String email,
        @NotBlank(message = "Subject is required") String subject,
        @NotBlank(message = "Message is required") @Size(min = 10, message = "Message must be at least 10 characters") String message
    ) {}
}
