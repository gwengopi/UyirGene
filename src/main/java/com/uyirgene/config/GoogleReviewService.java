package com.uyirgene.config;

import com.uyirgene.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleReviewService {

    private final GoogleReviewRepository repository;
    private final SiteConfigService siteConfigService;
    private final RestTemplate restTemplate;

    private static final String GOOGLE_PLACES_URL =
            "https://maps.googleapis.com/maps/api/place/details/json?place_id={placeId}&fields=reviews&key={apiKey}";

    /**
     * Get all active reviews for public display
     */
    @Cacheable(value = "googleReviews", key = "'active'")
    public List<GoogleReview> getActiveReviews() {
        return repository.findByActiveTrueOrderByPublishTimeDesc();
    }

    /**
     * Get all reviews for admin (including inactive)
     */
    public List<GoogleReview> getAllReviewsAdmin() {
        return repository.findAll();
    }

    /**
     * Fetch reviews from Google Places API and save to DB
     */
    @Transactional
    @CacheEvict(value = "googleReviews", allEntries = true)
    @SuppressWarnings("unchecked")
    public List<GoogleReview> fetchFromGoogle() {
        String placeId = siteConfigService.getConfigValue("GOOGLE_PLACE_ID");
        String apiKey = siteConfigService.getConfigValue("GOOGLE_API_KEY");

        if (placeId == null || placeId.isBlank()) {
            throw new IllegalArgumentException("Google Place ID is not configured. Please set it in Settings > Google Reviews.");
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("Google API Key is not configured. Please set it in Settings > Google Reviews.");
        }

        try {
            Map<String, Object> response = restTemplate.getForObject(
                    GOOGLE_PLACES_URL, Map.class, placeId, apiKey);

            if (response == null || !response.containsKey("result")) {
                String status = response != null ? (String) response.get("status") : "NO_RESPONSE";
                throw new RuntimeException("Google Places API returned status: " + status);
            }

            Map<String, Object> result = (Map<String, Object>) response.get("result");
            List<Map<String, Object>> reviews = (List<Map<String, Object>>) result.get("reviews");

            if (reviews == null || reviews.isEmpty()) {
                log.info("No reviews found for Place ID: {}", placeId);
                return List.of();
            }

            // Remove previously fetched Google reviews
            repository.deleteBySource("GOOGLE_API");

            // Save new reviews
            List<GoogleReview> savedReviews = reviews.stream().map(review -> {
                GoogleReview gr = GoogleReview.builder()
                        .authorName((String) review.get("author_name"))
                        .rating((Integer) review.get("rating"))
                        .reviewText((String) review.get("text"))
                        .relativeTimeDescription((String) review.get("relative_time_description"))
                        .profilePhotoUrl((String) review.get("profile_photo_url"))
                        .publishTime(review.get("time") != null ? ((Number) review.get("time")).longValue() : null)
                        .source("GOOGLE_API")
                        .active(true)
                        .build();
                return repository.save(gr);
            }).toList();

            log.info("Fetched and saved {} reviews from Google", savedReviews.size());
            return savedReviews;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch reviews from Google Places API", e);
            throw new RuntimeException("Failed to fetch reviews from Google: " + e.getMessage());
        }
    }

    /**
     * Create a manual review
     */
    @Transactional
    @CacheEvict(value = "googleReviews", allEntries = true)
    public GoogleReview createReview(GoogleReview review) {
        review.setSource("MANUAL");
        if (review.getActive() == null) {
            review.setActive(true);
        }
        if (review.getPublishTime() == null) {
            review.setPublishTime(System.currentTimeMillis() / 1000);
        }
        return repository.save(review);
    }

    /**
     * Update a review
     */
    @Transactional
    @CacheEvict(value = "googleReviews", allEntries = true)
    public GoogleReview updateReview(Long id, GoogleReview updates) {
        GoogleReview review = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));

        if (updates.getAuthorName() != null) review.setAuthorName(updates.getAuthorName());
        if (updates.getRating() != null) review.setRating(updates.getRating());
        if (updates.getReviewText() != null) review.setReviewText(updates.getReviewText());
        if (updates.getRelativeTimeDescription() != null) review.setRelativeTimeDescription(updates.getRelativeTimeDescription());
        if (updates.getProfilePhotoUrl() != null) review.setProfilePhotoUrl(updates.getProfilePhotoUrl());
        if (updates.getActive() != null) review.setActive(updates.getActive());

        return repository.save(review);
    }

    /**
     * Delete a review
     */
    @Transactional
    @CacheEvict(value = "googleReviews", allEntries = true)
    public void deleteReview(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Review not found");
        }
        repository.deleteById(id);
    }
}
