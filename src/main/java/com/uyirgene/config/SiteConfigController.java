package com.uyirgene.config;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
@Tag(name = "Site Configuration", description = "Site configuration management")
public class SiteConfigController {

    private final SiteConfigService configService;

    // ========== Public endpoints ==========

    @GetMapping("/images")
    @Operation(summary = "Get all image configurations")
    public ResponseEntity<Map<String, String>> getAllImages() {
        return ResponseEntity.ok(configService.getAllImageConfigs());
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get configurations by category")
    public ResponseEntity<Map<String, String>> getByCategory(@PathVariable("category") String category) {
        return ResponseEntity.ok(configService.getConfigMapByCategory(category));
    }

    @GetMapping("/key/{key}")
    @Operation(summary = "Get configuration value by key")
    public ResponseEntity<String> getByKey(@PathVariable("key") String key) {
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
}
