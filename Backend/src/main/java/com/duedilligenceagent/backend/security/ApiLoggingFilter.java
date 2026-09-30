package com.duedilligenceagent.backend.security;

import com.duedilligenceagent.backend.entities.ApiLog;
import com.duedilligenceagent.backend.repositories.ApiLogRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * Audit logging (SRS 1.14): every authenticated API call is recorded in the
 * api_logs table — service name, endpoint, status code, latency and success.
 * Never logs request bodies, headers or tokens (no secrets in the audit trail).
 * Auth endpoints are skipped: they are public and fire before authentication.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApiLoggingFilter extends OncePerRequestFilter {

    private final ApiLogRepository apiLogRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/")
                || path.startsWith("/api/auth/")
                || "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        LocalDateTime requestTime = LocalDateTime.now();
        try {
            filterChain.doFilter(request, response);
        } finally {
            record(request, response, requestTime);
        }
    }

    private void record(HttpServletRequest request, HttpServletResponse response,
                        LocalDateTime requestTime) {
        try {
            int status = response.getStatus();
            apiLogRepository.save(ApiLog.builder()
                    .serviceName(serviceName(request.getRequestURI()))
                    .endpoint(request.getMethod() + " " + request.getRequestURI())
                    .requestTime(requestTime)
                    .responseTime(LocalDateTime.now())
                    .statusCode(status)
                    .success(status < 400)
                    .errorMessage(null)
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to persist API log for {} {}: {}",
                    request.getMethod(), request.getRequestURI(), ex.getMessage());
        }
    }

    /** Derives the service name from the first path segment under /api. */
    private String serviceName(String uri) {
        String[] segments = uri.split("/");
        return segments.length > 2 ? segments[2] : "ROOT";
    }
}
