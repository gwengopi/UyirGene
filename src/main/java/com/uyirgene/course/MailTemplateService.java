package com.uyirgene.course;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MailTemplateService {

    private final MailTemplateRepository repository;

    @Transactional(readOnly = true)
    public List<MailTemplate> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<MailTemplate> findByKey(String key) {
        return repository.findByTemplateKey(key);
    }

    @Transactional
    public void initHtmlBody(String key, String html) {
        repository.findByTemplateKey(key).ifPresent(template -> {
            template.setHtmlBody(html);
            repository.save(template);
        });
    }

    @Transactional
    public MailTemplate update(Long id, String subject, String content) {
        MailTemplate template = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mail template not found: " + id));
        template.setSubject(subject);
        template.setContent(content);
        return repository.save(template);
    }
}
