package com.uyirgene.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.beans.factory.annotation.Value;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, UserDetailsService userDetailsService) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(
                            "/api/auth/**",
                            "/api/blogs/**",
                            "/api/certificates/verify/**",
                            "/api/reviews",
                            "/api/service-certifications/**",
                            "/api/service-testings/**",
                            "/api/service-diagnostics/**",
                            "/api/careers/**",
                            "/api/marketing/unsubscribe",
                            "/api/payment/webhook",
                            "/actuator/health"
                    ).permitAll()
                    // Page-view tracking (public, fire-and-forget)
                    .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/analytics/pageview").permitAll()
                    // Course & bundle public endpoints (read-only)
                    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/courses/**").permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/bundles", "/api/bundles/{id}", "/api/bundles/{id}/thumbnail", "/api/bundles/by-course/{courseId}", "/api/bundles/by-course-category").permitAll()
                    // Flagship program public endpoints (read-only; admin endpoints use @PreAuthorize)
                    .requestMatchers(org.springframework.http.HttpMethod.GET,
                            "/api/flagship", "/api/flagship/{id}", "/api/flagship/{id}/image",
                            "/api/flagship/slug/**", "/api/flagship/code/**",
                            "/api/flagship/{id}/manuals", "/api/flagship/{id}/manuals/{manualId}/download").permitAll()
                    // Standards public listing (download requires auth via @PreAuthorize)
                    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/standards").permitAll()
                    // Public site config & master data (non-admin, no sensitive keys exposed)
                    .requestMatchers(org.springframework.http.HttpMethod.GET,
                            "/api/config/images", "/api/config/image/**", "/api/config/category/**", "/api/config/key/**").permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.GET,
                            "/api/master-data/type/**", "/api/master-data/types",
                            "/api/master-data/categories", "/api/master-data/skill-levels").permitAll()
                    // Swagger - only accessible in dev (disabled in prod via springdoc config)
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                    .requestMatchers("/api/admin/**").authenticated()
                    .anyRequest().authenticated())
            .authenticationProvider(authenticationProvider(userDetailsService))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Parse allowed origins from configuration
        List<String> origins = Arrays.asList(allowedOrigins.split(","));

        // Check if any origin contains wildcard pattern (e.g., http://localhost:*)
        boolean hasWildcard = origins.stream().anyMatch(o -> o.contains("*"));
        if (hasWildcard) {
            configuration.setAllowedOriginPatterns(origins);
        } else {
            configuration.setAllowedOrigins(origins);
        }

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(86400L); // 24 h — reduces OPTIONS preflight round-trips

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
