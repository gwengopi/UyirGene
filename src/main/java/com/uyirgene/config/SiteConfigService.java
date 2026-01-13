package com.uyirgene.config;

import com.uyirgene.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteConfigService {

    private final SiteConfigRepository repository;

    /**
     * Get all active configurations
     */
    @Cacheable(value = "siteConfigs", key = "'all'")
    public List<SiteConfig> getAllConfigs() {
        return repository.findByActiveTrue();
    }

    /**
     * Get all configurations (including inactive) for admin
     */
    public List<SiteConfig> getAllConfigsAdmin() {
        return repository.findAll();
    }

    /**
     * Get configuration by key
     */
    @Cacheable(value = "siteConfigs", key = "#key")
    public String getConfigValue(String key) {
        return repository.findByKey(key)
                .filter(SiteConfig::getActive)
                .map(SiteConfig::getValue)
                .orElse(null);
    }

    /**
     * Get configuration by key with default value
     */
    public String getConfigValue(String key, String defaultValue) {
        String value = getConfigValue(key);
        return value != null ? value : defaultValue;
    }

    /**
     * Get all configurations by category
     */
    @Cacheable(value = "siteConfigs", key = "'category:' + #category")
    public List<SiteConfig> getConfigsByCategory(String category) {
        return repository.findByCategoryAndActiveTrue(category);
    }

    /**
     * Get configurations as a map (key -> value)
     */
    @Cacheable(value = "siteConfigs", key = "'map:' + #category")
    public Map<String, String> getConfigMapByCategory(String category) {
        return repository.findByCategoryAndActiveTrue(category).stream()
                .collect(Collectors.toMap(SiteConfig::getKey, SiteConfig::getValue));
    }

    /**
     * Get all image configurations
     */
    @Cacheable(value = "siteConfigs", key = "'images'")
    public Map<String, String> getAllImageConfigs() {
        return repository.findByType("IMAGE").stream()
                .filter(SiteConfig::getActive)
                .collect(Collectors.toMap(SiteConfig::getKey, SiteConfig::getValue));
    }

    /**
     * Create a new configuration
     */
    @Transactional
    @CacheEvict(value = "siteConfigs", allEntries = true)
    public SiteConfig createConfig(SiteConfig config) {
        if (repository.existsByKey(config.getKey())) {
            throw new IllegalArgumentException("Configuration with key '" + config.getKey() + "' already exists");
        }
        return repository.save(config);
    }

    /**
     * Update an existing configuration
     */
    @Transactional
    @CacheEvict(value = "siteConfigs", allEntries = true)
    public SiteConfig updateConfig(Long id, SiteConfig updates) {
        SiteConfig config = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Configuration not found"));

        if (updates.getValue() != null) config.setValue(updates.getValue());
        if (updates.getType() != null) config.setType(updates.getType());
        if (updates.getCategory() != null) config.setCategory(updates.getCategory());
        if (updates.getDescription() != null) config.setDescription(updates.getDescription());
        if (updates.getActive() != null) config.setActive(updates.getActive());

        return repository.save(config);
    }

    /**
     * Update configuration by key
     */
    @Transactional
    @CacheEvict(value = "siteConfigs", allEntries = true)
    public SiteConfig updateConfigByKey(String key, String value) {
        SiteConfig config = repository.findByKey(key)
                .orElseThrow(() -> new EntityNotFoundException("Configuration not found for key: " + key));
        config.setValue(value);
        return repository.save(config);
    }

    /**
     * Delete a configuration
     */
    @Transactional
    @CacheEvict(value = "siteConfigs", allEntries = true)
    public void deleteConfig(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Configuration not found");
        }
        repository.deleteById(id);
    }

    /**
     * Seed default configurations
     */
    @Transactional
    @CacheEvict(value = "siteConfigs", allEntries = true)
    public void seedDefaultConfigs() {
        // Logo images
        createIfNotExists("LOGO_MAIN", "https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png/:/rs=h:80,cg:true,m/qt=q:100/ll", "IMAGE", "LOGO", "Main logo");
        createIfNotExists("LOGO_SMALL", "https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png/:/rs=h:40,cg:true,m/qt=q:100/ll", "IMAGE", "LOGO", "Small logo for navbar");

        // Hero images
        createIfNotExists("HERO_MAIN", "https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/blob-91a7f99.png/:/rs=w:1920,h:1080,cg:true,m/qt=q:95", "IMAGE", "HERO", "Main hero background");
        createIfNotExists("HERO_LEARNING", "https://img1.wsimg.com/isteam/getty/2246976642/:/rs=w:1280,h:720,cg:true,m/qt=q:90", "IMAGE", "HERO", "Learning hero image");

        // Course images
        createIfNotExists("COURSE_PLACEHOLDER", "https://img1.wsimg.com/isteam/getty/2165387046/:/rs=w:400,h:300,cg:true,m/qt=q:85", "IMAGE", "COURSE", "Default course placeholder");
        createIfNotExists("COURSE_TRAINERS", "https://img1.wsimg.com/isteam/getty/2156390491/:/rs=w:600,h:400,cg:true,m/qt=q:90", "IMAGE", "COURSE", "Trainers image");
        createIfNotExists("COURSE_PRACTICAL", "https://img1.wsimg.com/isteam/getty/1938554573/:/rs=w:600,h:400,cg:true,m/qt=q:90", "IMAGE", "COURSE", "Practical learning image");
        createIfNotExists("COURSE_CERTIFICATION", "https://img1.wsimg.com/isteam/getty/1341288264/:/rs=w:600,h:400,cg:true,m/qt=q:90", "IMAGE", "COURSE", "Certification image");
        createIfNotExists("COURSE_REGULATORY", "https://img1.wsimg.com/isteam/getty/2165387046/:/rs=w:600,h:400,cg:true,m/qt=q:90", "IMAGE", "COURSE", "Regulatory courses image");

        // About images
        createIfNotExists("ABOUT_MISSION", "https://img1.wsimg.com/isteam/getty/852586044/:/rs=w:800,h:600,cg:true,m/qt=q:90", "IMAGE", "ABOUT", "About mission image");
        createIfNotExists("ABOUT_TEAM", "https://img1.wsimg.com/isteam/getty/1754192862/:/rs=w:800,h:600,cg:true,m/qt=q:90", "IMAGE", "ABOUT", "Team image");

        // Background images
        createIfNotExists("BG_TECHNOLOGY", "https://img1.wsimg.com/isteam/getty/2210258491/:/rs=w:1920,h:1080,cg:true,m/qt=q:90", "IMAGE", "BACKGROUND", "Technology background");
    }

    private void createIfNotExists(String key, String value, String type, String category, String description) {
        if (!repository.existsByKey(key)) {
            repository.save(SiteConfig.builder()
                    .key(key)
                    .value(value)
                    .type(type)
                    .category(category)
                    .description(description)
                    .active(true)
                    .build());
        }
    }
}
