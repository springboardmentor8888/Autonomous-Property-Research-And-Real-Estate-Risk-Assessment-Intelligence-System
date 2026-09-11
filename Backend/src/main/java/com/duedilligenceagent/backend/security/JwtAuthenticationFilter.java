package com.duedilligenceagent.backend.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Gatekeeper for every protected {@code /api/**} route.
 * <p>
 * Runs once per request: public paths (auth endpoints, health, Swagger)
 * pass straight through; everything else must carry
 * {@code Authorization: Bearer <access token>} where the token's {@code type}
 * claim is {@code "access"} — a refresh token used here is rejected, since
 * its only valid destination is {@code /api/auth/refresh}. Failures answer
 * with a plain 401 JSON body so the frontend can trigger its silent-refresh
 * flow instead of seeing an HTML error page.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserDetailsService userDetailsService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getServletPath();

        // Authentication endpoints do not require JWT.
        if (path.startsWith("/api/auth/") || path.startsWith("/api/health") || 
            path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") ||
            path.equals("/error")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Authorization header missing or invalid\"}");
            return;
        }

        String jwt = authHeader.substring(7);

        try {
            // Only access tokens may be used as Bearer credentials;
            // refresh tokens are valid solely at /api/auth/refresh.
            if (!jwtService.isAccessToken(jwt)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Invalid token type\"}");
                return;
            }

            String username = jwtService.extractUsername(jwt);

            if (username != null &&
                    SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(username);

                if (jwtService.isTokenValid(jwt, userDetails)) {

                    UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
                    );

                    SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Token expired or invalid\"}");
                    return;
                }
            }

        } catch (Exception e) {
            // Signature/expiry/claim problems — never echo the token or cause back.
            log.debug("JWT rejected for {} {}: {}", request.getMethod(), path, e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Token validation failed\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}