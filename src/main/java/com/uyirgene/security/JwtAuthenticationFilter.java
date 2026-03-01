package com.uyirgene.security;

import com.uyirgene.user.AppUserDetails;
import com.uyirgene.user.Role;
import com.uyirgene.user.User;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Validates JWTs and populates the SecurityContext.
 * UserDetails are built directly from token claims — no DB query per request.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        // Parse claims once — validates signature + expiry in a single operation
        Claims claims = jwtService.getValidClaims(token);
        if (claims != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String email = claims.getSubject();
            String roleName = claims.get("role", String.class);
            String name = claims.get("name", String.class);
            Object userIdObj = claims.get("userId");
            Long userId = userIdObj instanceof Number ? ((Number) userIdObj).longValue() : null;

            if (email != null && roleName != null) {
                // Build UserDetails from JWT claims — avoids a DB round-trip on every request
                Role role;
                try {
                    role = Role.valueOf(roleName);
                } catch (IllegalArgumentException e) {
                    filterChain.doFilter(request, response);
                    return;
                }
                User jwtUser = User.builder()
                        .id(userId)
                        .email(email)
                        .name(name)
                        .role(role)
                        .enabled(true)
                        .build();
                AppUserDetails userDetails = new AppUserDetails(jwtUser);
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
