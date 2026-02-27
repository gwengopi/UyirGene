package com.uyirgene.course;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;

/**
 * On startup, loads background images from classpath resources into flagship program records.
 * Only seeds if background_image is currently null (idempotent).
 * Images must be placed in src/main/resources/db/images/ before building.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(10)
public class FlagshipImageInitializer implements ApplicationRunner {

    private final FlagshipProgramRepository flagshipProgramRepository;

    // slug → classpath image path
    private static final String[][] IMAGE_MAPPINGS = {
        {"haccp-practitioner-level-4",    "db/images/flagship-haccp.jpg"},
        {"food-safety-officer-level-3",   "db/images/flagship-food-safety-officer.jpg"},
    };

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (String[] mapping : IMAGE_MAPPINGS) {
            String slug     = mapping[0];
            String resource = mapping[1];
            try {
                flagshipProgramRepository.findBySlug(slug).ifPresentOrElse(program -> {
                    if (program.getBackgroundImage() != null) {
                        log.debug("Flagship image already set for slug '{}', skipping.", slug);
                        return;
                    }
                    ClassPathResource res = new ClassPathResource(resource);
                    if (!res.exists()) {
                        log.warn("Flagship image resource not found: {} (slug='{}'). "
                                + "Place the file at src/main/resources/{} and restart.", resource, slug, resource);
                        return;
                    }
                    try (InputStream is = res.getInputStream()) {
                        byte[] imageBytes = is.readAllBytes();
                        program.setBackgroundImage(imageBytes);
                        program.setBackgroundImageContentType("image/jpeg");
                        flagshipProgramRepository.save(program);
                        log.info("Flagship background image loaded for slug '{}' ({} bytes).", slug, imageBytes.length);
                    } catch (Exception e) {
                        log.warn("Failed to read flagship image '{}': {}", resource, e.getMessage());
                    }
                }, () -> log.debug("No flagship program found for slug '{}', skipping image seed.", slug));
            } catch (Exception e) {
                log.warn("Error processing flagship image for slug '{}': {}", slug, e.getMessage());
            }
        }
    }
}
