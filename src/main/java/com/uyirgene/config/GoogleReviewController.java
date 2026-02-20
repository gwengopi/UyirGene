package com.uyirgene.config;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class GoogleReviewController {

    private final GoogleReviewService reviewService;
    private final SiteConfigService siteConfigService;

    // ==================== Public Endpoints ====================

    /**
     * Get all active reviews and google review link for public display
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getActiveReviews() {
        Map<String, Object> result = new HashMap<>();
        result.put("reviews", reviewService.getActiveReviews());
        result.put("googleReviewLink", siteConfigService.getConfigValue("GOOGLE_REVIEW_LINK", ""));
        return ResponseEntity.ok(result);
    }

    // ==================== Admin Endpoints ====================

    /**
     * Get all reviews (including inactive) - Admin only
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<GoogleReview>> getAllReviewsAdmin() {
        return ResponseEntity.ok(reviewService.getAllReviewsAdmin());
    }

    /**
     * Fetch reviews from Google Places API - Admin only
     */
    @PostMapping("/fetch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<GoogleReview>> fetchFromGoogle() {
        return ResponseEntity.ok(reviewService.fetchFromGoogle());
    }

    /**
     * Manually add a review - Admin only
     */
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GoogleReview> createReview(@RequestBody GoogleReview review) {
        return ResponseEntity.ok(reviewService.createReview(review));
    }

    /**
     * Update a review - Admin only
     */
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GoogleReview> updateReview(@PathVariable Long id, @RequestBody GoogleReview review) {
        return ResponseEntity.ok(reviewService.updateReview(id, review));
    }

    /**
     * Delete a review - Admin only
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
