package com.uyirgene.config;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.uyirgene.user.AppUserDetails;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class PageViewController {

    private final PageViewRepository pageViewRepository;

    // ── DTOs ─────────────────────────────────────────────────────────────────

    @Data
    public static class PageViewRequest {
        private String path;
        private String sessionId;
        private String referrer;
        private String userAgent;
    }

    @Data
    public static class TopPageEntry {
        private final String path;
        private final long count;
    }

    @Data
    public static class DailyEntry {
        private final String date;
        private final long count;
    }

    @Data
    public static class DeviceBreakdown {
        private final long desktop;
        private final long mobile;
        private final long tablet;
    }

    @Data
    public static class VisitorStatsResponse {
        private final long totalVisits;
        private final long uniqueVisitors;
        private final List<TopPageEntry> topPages;
        private final List<DailyEntry> dailyChart;
        private final DeviceBreakdown deviceBreakdown;
    }

    // ── Endpoints ─────────────────────────────────────────────────────────────

    /**
     * Public endpoint — receives a page-view event from the frontend.
     * No auth required; /admin/** paths are filtered client-side.
     */
    @PostMapping("/pageview")
    public ResponseEntity<Void> recordPageView(
            @RequestBody PageViewRequest req,
            @AuthenticationPrincipal AppUserDetails principal) {

        if (req.getPath() == null || req.getSessionId() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Sanitise: strip query params to avoid bloated paths
        String path = req.getPath();
        int qIdx = path.indexOf('?');
        if (qIdx >= 0) path = path.substring(0, qIdx);
        if (path.length() > 500) path = path.substring(0, 500);

        String sessionId = req.getSessionId().length() > 64
                ? req.getSessionId().substring(0, 64) : req.getSessionId();

        String deviceType = deriveDeviceType(req.getUserAgent());

        Long userId = principal != null ? principal.getUser().getId() : null;

        pageViewRepository.save(PageView.builder()
                .path(path)
                .sessionId(sessionId)
                .userId(userId)
                .referrer(req.getReferrer())
                .deviceType(deviceType)
                .build());

        return ResponseEntity.noContent().build();
    }

    /**
     * Admin endpoint — aggregated visitor statistics.
     * period: DAY | WEEK | MONTH | YEAR (default MONTH)
     */
    @GetMapping("/admin/visitors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VisitorStatsResponse> getVisitorStats(
            @RequestParam(defaultValue = "MONTH") String period) {

        LocalDateTime since = sinceFromPeriod(period);
        LocalDateTime now = LocalDateTime.now();

        long totalVisits = pageViewRepository.countByViewedAtAfter(since);
        long uniqueVisitors = pageViewRepository.countDistinctSessionsByViewedAtAfter(since);

        List<TopPageEntry> topPages = pageViewRepository
                .findTopPathsByViewedAtAfter(since, 10)
                .stream()
                .map(row -> new TopPageEntry((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList());

        List<DailyEntry> dailyChart = pageViewRepository
                .findDailyCountsByViewedAtBetween(since, now)
                .stream()
                .map(row -> new DailyEntry(row[0].toString(), ((Number) row[1]).longValue()))
                .collect(Collectors.toList());

        DeviceBreakdown deviceBreakdown = new DeviceBreakdown(
                pageViewRepository.countByDeviceTypeAndViewedAtAfter("desktop", since),
                pageViewRepository.countByDeviceTypeAndViewedAtAfter("mobile", since),
                pageViewRepository.countByDeviceTypeAndViewedAtAfter("tablet", since)
        );

        return ResponseEntity.ok(new VisitorStatsResponse(
                totalVisits, uniqueVisitors, topPages, dailyChart, deviceBreakdown));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private LocalDateTime sinceFromPeriod(String period) {
        LocalDateTime now = LocalDateTime.now();
        return switch (period.toUpperCase()) {
            case "DAY"  -> now.toLocalDate().atStartOfDay();
            case "WEEK" -> now.minusDays(6).toLocalDate().atStartOfDay();
            case "YEAR" -> now.minusDays(364).toLocalDate().atStartOfDay();
            default     -> now.minusDays(29).toLocalDate().atStartOfDay(); // MONTH
        };
    }

    private String deriveDeviceType(String ua) {
        if (ua == null || ua.isBlank()) return "desktop";
        String lower = ua.toLowerCase();
        if (lower.contains("tablet") || lower.contains("ipad")) return "tablet";
        if (lower.contains("mobile") || lower.contains("android") || lower.contains("iphone")) return "mobile";
        return "desktop";
    }
}
