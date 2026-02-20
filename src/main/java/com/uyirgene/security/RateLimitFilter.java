package com.uyirgene.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiting filter for authentication endpoints.
 * Limits requests per IP to prevent brute force attacks.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int AUTH_MAX_REQUESTS = 20;
    private static final int API_MAX_REQUESTS = 60;
    private static final long WINDOW_MS = 60_000; // 1 minute

    private final ConcurrentHashMap<String, RateInfo> rateLimits = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Determine rate limit based on endpoint sensitivity
        int maxRequests;
        String rateLimitKey;
        if (path.startsWith("/api/auth/")) {
            maxRequests = AUTH_MAX_REQUESTS;
            rateLimitKey = "auth";
        } else if (path.startsWith("/api/videos/decrypt") || path.startsWith("/api/certificates/verify")) {
            maxRequests = API_MAX_REQUESTS;
            rateLimitKey = "api-sensitive";
        } else if ("POST".equals(method) && path.contains("/enroll")) {
            maxRequests = API_MAX_REQUESTS;
            rateLimitKey = "enroll";
        } else {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        String key = clientIp + ":" + rateLimitKey;

        RateInfo info = rateLimits.compute(key, (k, existing) -> {
            long now = System.currentTimeMillis();
            if (existing == null || now - existing.windowStart > WINDOW_MS) {
                return new RateInfo(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (info.count.get() > maxRequests) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Too many requests. Please try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class RateInfo {
        final long windowStart;
        final AtomicInteger count;

        RateInfo(long windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
