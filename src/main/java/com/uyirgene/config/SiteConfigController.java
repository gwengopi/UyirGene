package com.uyirgene.config;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
@Tag(name = "Site Configuration", description = "Site configuration management")
public class SiteConfigController {

    private final SiteConfigService configService;

    // Keys that must never be exposed via the public API
    private static final Set<String> SENSITIVE_KEYS = Set.of(
            "GOOGLE_API_KEY", "GOOGLE_PLACE_ID", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET",
            "SMTP_PASSWORD", "JWT_SECRET", "ENCRYPTION_KEY"
    );

    // ========== Public endpoints ==========

    @GetMapping("/images")
    @Operation(summary = "Get all image configurations")
    public ResponseEntity<Map<String, String>> getAllImages() {
        return ResponseEntity.ok(configService.getAllImageConfigs());
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get configurations by category")
    public ResponseEntity<Map<String, String>> getByCategory(@PathVariable("category") String category) {
        // Filter out sensitive keys from public category responses
        Map<String, String> configs = configService.getConfigMapByCategory(category);
        SENSITIVE_KEYS.forEach(configs::remove);
        return ResponseEntity.ok(configs);
    }

    @GetMapping("/key/{key}")
    @Operation(summary = "Get configuration value by key")
    public ResponseEntity<String> getByKey(@PathVariable("key") String key) {
        // Block access to sensitive configuration keys
        if (SENSITIVE_KEYS.contains(key.toUpperCase())) {
            return ResponseEntity.notFound().build();
        }
        String value = configService.getConfigValue(key);
        if (value == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(value);
    }

    // ========== Admin endpoints ==========

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get all configurations (admin)")
    public ResponseEntity<List<SiteConfig>> getAllConfigsAdmin() {
        return ResponseEntity.ok(configService.getAllConfigsAdmin());
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new configuration")
    public ResponseEntity<SiteConfig> createConfig(@RequestBody SiteConfig config) {
        return ResponseEntity.ok(configService.createConfig(config));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a configuration")
    public ResponseEntity<SiteConfig> updateConfig(
            @PathVariable("id") Long id,
            @RequestBody SiteConfig config) {
        return ResponseEntity.ok(configService.updateConfig(id, config));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a configuration")
    public ResponseEntity<Void> deleteConfig(@PathVariable("id") Long id) {
        configService.deleteConfig(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/seed")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Seed default configurations")
    public ResponseEntity<String> seedDefaults() {
        configService.seedDefaultConfigs();
        return ResponseEntity.ok("Default configurations seeded successfully");
    }

    // ========== Certificate number format endpoints ==========

    @GetMapping("/admin/cert-number")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get certificate number format config")
    public ResponseEntity<Map<String, Object>> getCertNumberConfig() {
        String format = configService.getConfigValueFresh("certNumberFormat", "UG-{YEAR}-{SEQ:5}");
        long seq = configService.getCurrentCertSeq();
        Map<String, Object> resp = new HashMap<>();
        resp.put("format", format);
        resp.put("currentSeq", seq);
        resp.put("preview", configService.previewCertNumber(format, seq + 1));
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/admin/cert-number")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update certificate number format and/or sequence")
    public ResponseEntity<Map<String, Object>> updateCertNumberConfig(@RequestBody Map<String, Object> body) {
        if (body.containsKey("format")) {
            String fmt = (String) body.get("format");
            if (fmt == null || fmt.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Format cannot be empty"));
            }
            // A format with no {SEQ} token produces the same ID for every certificate
            if (!fmt.contains("{SEQ}") && !fmt.matches(".*\\{SEQ:\\d+\\}.*")) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Format must include {SEQ} or {SEQ:N} so each certificate gets a unique number"));
            }
            configService.updateConfigByKey("certNumberFormat", fmt);
        }
        if (body.containsKey("seq")) {
            long newSeq = Long.parseLong(body.get("seq").toString());
            configService.resetCertSeq(newSeq);
        }
        String format = configService.getConfigValueFresh("certNumberFormat", "UG-{YEAR}-{SEQ:5}");
        long seq = configService.getCurrentCertSeq();
        Map<String, Object> resp = new HashMap<>();
        resp.put("format", format);
        resp.put("currentSeq", seq);
        resp.put("preview", configService.previewCertNumber(format, seq + 1));
        return ResponseEntity.ok(resp);
    }
}
