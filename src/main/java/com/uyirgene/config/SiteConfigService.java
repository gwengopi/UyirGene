package com.uyirgene.config;

import com.uyirgene.exception.EntityNotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SiteConfigService {

    private final SiteConfigRepository repository;
    private final JdbcTemplate jdbcTemplate;

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
     * Get configuration by key (cached).
     */
    @Cacheable(value = "siteConfigs", key = "#key")
    public String getConfigValue(String key) {
        return repository.findByKey(key)
                .filter(SiteConfig::getActive)
                .map(SiteConfig::getValue)
                .orElse(null);
    }

    /**
     * Get configuration by key with default value (cached).
     */
    public String getConfigValue(String key, String defaultValue) {
        String value = getConfigValue(key);
        return value != null ? value : defaultValue;
    }

    /**
     * Get configuration by key directly from DB, bypassing cache.
     * Use this when the value may have been updated at runtime (e.g. during batch processing).
     */
    public String getConfigValueFresh(String key) {
        return repository.findByKey(key)
                .filter(SiteConfig::getActive)
                .map(SiteConfig::getValue)
                .orElse(null);
    }

    /**
     * Get configuration by key directly from DB with default, bypassing cache.
     */
    public String getConfigValueFresh(String key, String defaultValue) {
        String value = getConfigValueFresh(key);
        return (value != null && !value.isBlank()) ? value : defaultValue;
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
     * Get a configuration by ID
     */
    public SiteConfig getConfigById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Configuration not found"));
    }

    /**
     * Upload an image file for a configuration.
     * Stores the raw bytes in image_data and sets value to the serve URL.
     */
    @Transactional
    @CacheEvict(value = "siteConfigs", allEntries = true)
    public SiteConfig uploadImage(Long id, MultipartFile file) throws IOException {
        SiteConfig config = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Configuration not found"));
        config.setImageData(file.getBytes());
        config.setImageContentType(file.getContentType());
        config.setValue("/api/config/image/" + id);
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
     * Atomically increment the certificate sequence counter and return the
     * formatted certificate number using the configured format pattern.
     *
     * Uses a PostgreSQL sequence (cert_number_seq) via NEXTVAL — sequences are
     * atomic, never repeat, and are completely independent of any JPA session,
     * Spring transaction, or OSIV EntityManager on the calling thread.
     *
     * Supported tokens in the format string:
     *   {YEAR}   – 4-digit year        e.g. 2026
     *   {YY}     – 2-digit year        e.g. 26
     *   {MONTH}  – 2-digit month       e.g. 02
     *   {DD}     – 2-digit day         e.g. 28
     *   {SEQ}    – sequence (no pad)   e.g. 42
     *   {SEQ:N}  – sequence zero-padded to N digits  e.g. 00042
     */
    public String getNextFormattedCertNumber() {
        // Use direct JDBC — bypasses any Hibernate L1/L2 cache so we always see
        // the format the admin saved, not a cached copy from an earlier request.
        String format = null;
        try {
            format = jdbcTemplate.queryForObject(
                    "SELECT config_value FROM site_config WHERE config_key = 'certNumberFormat' AND is_active = true",
                    String.class);
        } catch (Exception e) {
            log.warn("[CertSeq] Could not read certNumberFormat from DB: {}", e.getMessage());
        }
        if (format == null || format.isBlank()) {
            format = "UG-{YEAR}-{SEQ:5}";
            log.warn("[CertSeq] certNumberFormat not found in DB — using default '{}'", format);
        }

        // Safety net: create the sequence inline in case @PostConstruct failed silently.
        // CREATE SEQUENCE IF NOT EXISTS is idempotent, so this adds no overhead on the happy path.
        try {
            jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS cert_number_seq");
        } catch (Exception ignored) {}

        Long nextSeq = jdbcTemplate.queryForObject("SELECT NEXTVAL('cert_number_seq')", Long.class);
        String result = applyCertFormat(format, nextSeq);
        log.info("[CertSeq] format='{}' NEXTVAL={} → certificateId='{}'", format, nextSeq, result);
        return result;
    }

    /**
     * Returns the last sequence value that was handed out (i.e. the number on the
     * most recently generated certificate).  Returns 0 if no certificate has been
     * generated yet since the sequence was created/reset.
     */
    public long getCurrentCertSeq() {
        return jdbcTemplate.query(
                "SELECT last_value, is_called FROM cert_number_seq",
                rs -> {
                    if (rs.next()) {
                        long lastValue = rs.getLong("last_value");
                        boolean isCalled = rs.getBoolean("is_called");
                        // is_called=true  → last_value IS the last number handed out
                        // is_called=false → sequence hasn't been used; last_value is the
                        //                   next value that NEXTVAL would return, so "current" = last_value - 1
                        return isCalled ? lastValue : lastValue - 1;
                    }
                    return 0L;
                }
        );
    }

    /**
     * Reset the certificate sequence so the NEXT certificate gets number (value + 1).
     * Equivalent to the old behaviour where the admin stored N and the first cert was N+1.
     */
    public void resetCertSeq(long value) {
        // SETVAL(seq, N, true) → next NEXTVAL returns N+1
        jdbcTemplate.queryForObject("SELECT SETVAL('cert_number_seq', ?, true)", Long.class, value);
    }

    /**
     * Preview what a certificate number will look like for a given format and sequence.
     * Does NOT increment the counter.
     */
    public String previewCertNumber(String format, long seq) {
        return applyCertFormat(format, seq);
    }

    private String applyCertFormat(String format, long seq) {
        LocalDateTime now = LocalDateTime.now();
        String result = format;

        result = result.replace("{YEAR}",  String.valueOf(now.getYear()));
        result = result.replace("{YY}",    String.format("%02d", now.getYear() % 100));
        result = result.replace("{MONTH}", String.format("%02d", now.getMonthValue()));
        result = result.replace("{DD}",    String.format("%02d", now.getDayOfMonth()));

        // {SEQ:N} with zero-padding — must be replaced before bare {SEQ}
        Pattern padded = Pattern.compile("\\{SEQ:(\\d+)\\}");
        Matcher m = padded.matcher(result);
        if (m.find()) {
            int width = Integer.parseInt(m.group(1));
            result = result.replace(m.group(0), String.format("%0" + width + "d", seq));
        }

        // Bare {SEQ} without padding
        result = result.replace("{SEQ}", String.valueOf(seq));

        return result;
    }

    /**
     * Ensure cert_number_seq exists every time the application starts.
     * This is a safety net in case the V44 Flyway migration did not run
     * (e.g., was marked failed in flyway_schema_history).
     * CREATE SEQUENCE IF NOT EXISTS is idempotent — safe to call repeatedly.
     */
    @PostConstruct
    public void ensureCertSequenceExists() {
        try {
            jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS cert_number_seq");

            // If the sequence has never been called, seed from certNumberSeq site_config row
            // so the first certificate number continues from wherever the admin left off.
            Boolean isCalled = jdbcTemplate.query(
                    "SELECT is_called FROM cert_number_seq",
                    rs -> rs.next() ? rs.getBoolean("is_called") : false
            );
            if (Boolean.FALSE.equals(isCalled)) {
                repository.findByKey("certNumberSeq").ifPresent(cfg -> {
                    try {
                        long seed = Long.parseLong(cfg.getValue().trim());
                        if (seed > 0) {
                            jdbcTemplate.queryForObject(
                                    "SELECT SETVAL('cert_number_seq', ?, true)", Long.class, seed);
                            log.info("[CertSeq] Sequence seeded from certNumberSeq config: {}", seed);
                        }
                    } catch (NumberFormatException ignored) { }
                });
            }

            // Log current sequence state for diagnostic visibility
            jdbcTemplate.query("SELECT last_value, is_called FROM cert_number_seq", rs -> {
                if (rs.next()) {
                    log.info("[CertSeq] cert_number_seq ready: last_value={}, is_called={}",
                            rs.getLong("last_value"), rs.getBoolean("is_called"));
                }
            });
        } catch (Exception ex) {
            log.error("[CertSeq] Failed to ensure cert_number_seq exists: {}", ex.getMessage(), ex);
        }
    }

    /**
     * Seed default configurations
     */
    @Transactional
    @CacheEvict(value = "siteConfigs", allEntries = true)
    @PostConstruct
    public void seedDefaultConfigs() {
        // Logo images
        createIfNotExists("LOGO_MAIN", "https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png/:/rs=h:80,cg:true,m/qt=q:100/ll", "IMAGE", "LOGO", "Main logo");
        createIfNotExists("LOGO_SMALL", "https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png/:/rs=h:40,cg:true,m/qt=q:100/ll", "IMAGE", "LOGO", "Small logo for navbar");
        createIfNotExists("FAVICON", "https://uyirgene.com/favicon.ico", "IMAGE", "LOGO", "Browser tab favicon (32x32 recommended)");

        // Hero images
        createIfNotExists("HERO_MAIN", "https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/blob-91a7f99.png/:/rs=w:1920,h:1080,cg:true,m/qt=q:95", "IMAGE", "HERO", "Main hero background");
        createIfNotExists("HERO_LEARNING", "https://img1.wsimg.com/isteam/getty/2246976642/:/rs=w:1280,h:720,cg:true,m/qt=q:90", "IMAGE", "HERO", "Learning hero image");

        // Course images
        createIfNotExists("COURSE_PLACEHOLDER", "https://img1.wsimg.com/isteam/getty/2165387046/:/rs=w:400,h:300,cg:true,m/qt=q:85", "IMAGE", "COURSE", "Default course placeholder");
        createIfNotExists("COURSE_TRAINERS", "https://img1.wsimg.com/isteam/getty/2156390491/:/rs=w:600,h:400,cg:true,m/qt=q:90", "IMAGE", "COURSE", "Trainers image");
        createIfNotExists("COURSE_PRACTICAL", "https://img1.wsimg.com/isteam/getty/1938554573/:/rs=w:600,h:400,cg:true,m/qt=q:90", "IMAGE", "COURSE", "Practical learning image");
        createIfNotExists("COURSE_CERTIFICATION", "https://img1.wsimg.com/isteam/getty/1341288264/:/rs=w:600,h:400,cg:true,m/qt=q:90", "IMAGE", "COURSE", "Certification image");
        createIfNotExists("COURSE_REGULATORY", "https://img1.wsimg.com/isteam/getty/2165387046/:/rs=w:600,h:400,cg:true,m/qt=q:90", "IMAGE", "COURSE", "Regulatory courses image");

        // Service images
        createIfNotExists("SERVICE_MICROBIOLOGY", "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=400&fit=crop&q=80", "IMAGE", "SERVICE", "Microbiology Research service image");
        createIfNotExists("SERVICE_CERTIFICATION", "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop&q=80", "IMAGE", "SERVICE", "Certification service image");
        createIfNotExists("SERVICE_GMO_TESTING", "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop&q=80", "IMAGE", "SERVICE", "GMO Testing service image");
        createIfNotExists("SERVICE_CLINICAL_DIAGNOSTICS", "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop&q=80", "IMAGE", "SERVICE", "Clinical Diagnostics service image");

        // About images
        createIfNotExists("ABOUT_MISSION", "https://img1.wsimg.com/isteam/getty/852586044/:/rs=w:800,h:600,cg:true,m/qt=q:90", "IMAGE", "ABOUT", "About mission image");
        createIfNotExists("ABOUT_TEAM", "https://img1.wsimg.com/isteam/getty/1754192862/:/rs=w:800,h:600,cg:true,m/qt=q:90", "IMAGE", "ABOUT", "Team image");

        // Background images
        createIfNotExists("BG_TECHNOLOGY", "https://img1.wsimg.com/isteam/getty/2210258491/:/rs=w:1920,h:1080,cg:true,m/qt=q:90", "IMAGE", "BACKGROUND", "Technology background");

        // Contact and Communication
        createIfNotExists("TALK_TO_EXPERT_URL", "https://api.whatsapp.com/send/?phone=919943712383&text&type=phone_number&app_absent=0", "URL", "CONTACT", "Talk to Expert WhatsApp URL");
        createIfNotExists("CONTACT_PHONE", "+91 99437 12383", "TEXT", "CONTACT", "Contact phone number for display");
        createIfNotExists("CONTACT_WHATSAPP", "919943712383", "TEXT", "CONTACT", "WhatsApp number (country code, no +)");
        createIfNotExists("CONTACT_EMAIL", "info@uyirgene.com", "TEXT", "CONTACT", "Primary contact email");
        createIfNotExists("CONTACT_EMAIL_ALT", "uyirgene@gmail.com", "TEXT", "CONTACT", "Alternate contact email");
        createIfNotExists("CONTACT_WEBSITE", "www.uyirgene.com", "TEXT", "CONTACT", "Website URL");
        createIfNotExists("CONTACT_ADDRESS", "Uyir-Tech International Testing Laboratory, Research and Training Institute, Bharathi Nagar, NGO Colony, Sattur, Tamil Nadu, India", "TEXT", "CONTACT", "Office address");

        // Certification Settings
        createIfNotExists("PASS_MARK_PERCENTAGE", "60", "TEXT", "SETTINGS", "Pass mark percentage for course completion certificate");
        createIfNotExists("RESULT_DELAY_HOURS", "48", "TEXT", "SETTINGS", "Hours to wait before publishing test results");

        // Footer Configuration
        createIfNotExists("FOOTER_TAGLINE", "Professional Training Institute | ISO 9001 Certified | Training Partner of Skill India Digital Hub (Govt of India)", "TEXT", "FOOTER", "Footer tagline/description");
        createIfNotExists("FOOTER_COPYRIGHT", "Uyirgene International. All rights reserved.", "TEXT", "FOOTER", "Copyright text (year is added automatically)");
        createIfNotExists("FOOTER_BOTTOM_TEXT", "Excellence in Food Safety & Quality Training", "TEXT", "FOOTER", "Text shown at bottom of footer");

        // Footer Social Links (JSON array)
        createIfNotExists("FOOTER_SOCIAL_LINKS", "[{\"name\":\"Facebook\",\"url\":\"https://facebook.com/uyirgene\",\"icon\":\"facebook\"},{\"name\":\"Twitter\",\"url\":\"https://twitter.com/uyirgene\",\"icon\":\"twitter\"},{\"name\":\"LinkedIn\",\"url\":\"https://linkedin.com/company/uyirgene\",\"icon\":\"linkedin\"},{\"name\":\"YouTube\",\"url\":\"https://youtube.com/@uyirgene\",\"icon\":\"youtube\"},{\"name\":\"WhatsApp\",\"url\":\"https://wa.me/919943712383\",\"icon\":\"whatsapp\"},{\"name\":\"Instagram\",\"url\":\"https://instagram.com/uyirgene\",\"icon\":\"instagram\"}]", "JSON", "FOOTER", "Social media links (JSON array with name, url, icon)");

        // Footer Platform Links (JSON array)
        createIfNotExists("FOOTER_PLATFORM_LINKS", "[{\"label\":\"Courses\",\"path\":\"/courses\"},{\"label\":\"About Us\",\"path\":\"/about\"},{\"label\":\"Blog\",\"path\":\"/blog\"},{\"label\":\"Careers\",\"path\":\"/careers\"}]", "JSON", "FOOTER", "Platform section links (JSON array with label, path)");

        // Footer Support Links (JSON array)
        createIfNotExists("FOOTER_SUPPORT_LINKS", "[{\"label\":\"Contact Us\",\"path\":\"/contact\"},{\"label\":\"FAQs\",\"path\":\"/faq\"}]", "JSON", "FOOTER", "Support section links (JSON array with label, path)");

        // Footer Legal Links (JSON array)
        createIfNotExists("FOOTER_LEGAL_LINKS", "[{\"label\":\"Terms of Service\",\"path\":\"/terms\"},{\"label\":\"Privacy Policy\",\"path\":\"/privacy\"},{\"label\":\"Cookie Policy\",\"path\":\"/cookies\"},{\"label\":\"Refund Policy\",\"path\":\"/refund\"},{\"label\":\"Accessibility\",\"path\":\"/accessibility\"}]", "JSON", "FOOTER", "Legal section links (JSON array with label, path)");

        // Google Review Configuration
        createIfNotExists("GOOGLE_REVIEW_LINK", "", "URL", "REVIEW", "Google Maps review page link (for Leave a Review button)");
        createIfNotExists("GOOGLE_PLACE_ID", "", "TEXT", "REVIEW", "Google Place ID for fetching reviews via Places API");
        createIfNotExists("GOOGLE_API_KEY", "", "TEXT", "REVIEW", "Google Places API key for fetching reviews");

        // Marketing Email Configuration
        createIfNotExists("marketingFromEmail", "", "TEXT", "MARKETING", "From email address for marketing campaigns (leave blank to use default mail.from)");
        createIfNotExists("marketingFromName", "UyirGene", "TEXT", "MARKETING", "Sender display name for marketing campaigns");
        createIfNotExists("marketingFooterAddress", "", "TEXT", "MARKETING", "Physical address shown in marketing email footer (leave blank to use CONTACT_ADDRESS)");

        // Certificate Number Settings
        // certNumberSeq is intentionally NOT seeded here — the counter is now maintained
        // by the PostgreSQL sequence cert_number_seq (see migration V44).
        createIfNotExists("certNumberFormat", "UG-{YEAR}-{SEQ:5}", "TEXT", "CERTIFICATE", "Format for auto-generated certificate numbers. Tokens: {YEAR},{YY},{MONTH},{DD},{SEQ},{SEQ:N}");
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
