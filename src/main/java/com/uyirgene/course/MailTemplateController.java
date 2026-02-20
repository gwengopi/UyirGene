package com.uyirgene.course;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mail-templates")
@RequiredArgsConstructor
public class MailTemplateController {

    private final MailTemplateService service;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MailTemplate>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MailTemplate> update(@PathVariable Long id, @RequestBody UpdateDto dto) {
        return ResponseEntity.ok(service.update(id, dto.subject(), dto.content()));
    }

    record UpdateDto(String subject, String content) {}
}
