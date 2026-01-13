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

            // Enforce HTTPS (only in production)
            // Note: This header should only be set when using HTTPS
            // httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

            // Control referrer information
            httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

            // Content Security Policy (basic policy, adjust as needed)
            // httpResponse.setHeader("Content-Security-Policy", "default-src 'self'");

            chain.doFilter(request, response);
        });

        registrationBean.addUrlPatterns("/*");
        registrationBean.setName("securityHeadersFilter");
        registrationBean.setOrder(1);

        return registrationBean;
    }
}
