package com.uyirgene.config;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faq")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    // ==================== Public Endpoints ====================

    /**
     * Get all active FAQs grouped by category
     */
    @GetMapping
    public ResponseEntity<Map<String, List<Faq>>> getAllFaqs() {
        return ResponseEntity.ok(faqService.getAllFaqsGrouped());
    }

    /**
     * Get FAQs by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Faq>> getFaqsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(faqService.getFaqsByCategory(category));
    }

    /**
     * Get available categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, String>>> getCategories() {
        return ResponseEntity.ok(faqService.getCategories());
    }

    // ==================== Admin Endpoints ====================

    /**
     * Get all FAQs (including inactive) - Admin only
     */
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<List<Faq>> getAllFaqsAdmin() {
        return ResponseEntity.ok(faqService.getAllFaqsAdmin());
    }

    /**
     * Get FAQ by ID - Admin only
     */
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Faq> getFaqById(@PathVariable Long id) {
        return ResponseEntity.ok(faqService.getFaqById(id));
    }

    /**
     * Create a new FAQ - Admin only
     */
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Faq> createFaq(@RequestBody Faq faq) {
        return ResponseEntity.ok(faqService.createFaq(faq));
    }

    /**
     * Update a FAQ - Admin only
     */
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Faq> updateFaq(@PathVariable Long id, @RequestBody Faq faq) {
        return ResponseEntity.ok(faqService.updateFaq(id, faq));
    }

    /**
     * Delete a FAQ - Admin only
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFaq(@PathVariable Long id) {
        faqService.deleteFaq(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Seed default FAQs - Admin only
     */
    @PostMapping("/admin/seed")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> seedFaqs() {
        faqService.seedDefaultFaqs();
        return ResponseEntity.ok("Default FAQs seeded successfully");
    }
}
