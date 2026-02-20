package com.uyirgene.config;

import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityHeadersConfig {

    @Bean
    public FilterRegistrationBean<Filter> securityHeadersFilter() {
        FilterRegistrationBean<Filter> registrationBean = new FilterRegistrationBean<>();

        registrationBean.setFilter((request, response, chain) -> {
            HttpServletResponse httpResponse = (HttpServletResponse) response;

            // Prevent clickjacking
            httpResponse.setHeader("X-Frame-Options", "DENY");

            // Prevent MIME type sniffing
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");

            // Enable XSS protection
            httpResponse.setHeader("X-XSS-Protection", "1; mode=block");

            // Enforce HTTPS
            httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

            // Control referrer information
            httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

            // Content Security Policy
            httpResponse.setHeader("Content-Security-Policy",
                    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com; " +
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                    "font-src 'self' https://fonts.gstatic.com; " +
                    "img-src 'self' data: blob: https:; " +
                    "frame-src https://www.youtube.com https://player.vimeo.com https://drive.google.com https://docs.google.com https://accounts.google.com; " +
                    "connect-src 'self' https://www.googleapis.com https://accounts.google.com");

            // Prevent browsers from caching sensitive responses
            httpResponse.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

            chain.doFilter(request, response);
        });

        registrationBean.addUrlPatterns("/*");
        registrationBean.setName("securityHeadersFilter");
        registrationBean.setOrder(1);

        return registrationBean;
    }
}
