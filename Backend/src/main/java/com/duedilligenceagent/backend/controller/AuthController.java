package com.duedilligenceagent.backend.controller;

import com.duedilligenceagent.backend.dto.AuthResponse;
import com.duedilligenceagent.backend.dto.LoginRequest;
import com.duedilligenceagent.backend.dto.RegisterRequest;
import com.duedilligenceagent.backend.service.AuthService;
import com.duedilligenceagent.backend.service.RefreshTokenService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public auth entry points: register / login / refresh / logout.
 * <p>
 * Refresh and logout read the refresh token straight from the HttpOnly
 * cookie (not the JSON body) so JavaScript never has to handle it.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(AuthService authService, RefreshTokenService refreshTokenService) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {

        return ResponseEntity.ok(
                authService.register(request, response)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {

        return ResponseEntity.ok(
                authService.login(request, response)
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {

        // Get refresh token from HttpOnly cookie
        String refreshToken = extractRefreshTokenFromCookie(request);
        
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new AuthResponse(null, null, null, "Refresh token not found")
            );
        }

        return refreshTokenService.refreshAccessToken(refreshToken, response)
                .map(newAccessToken -> {
                    // Get user info from refresh token
                    String email = refreshTokenService.extractEmailFromToken(refreshToken);
                    String role = refreshTokenService.extractRoleFromToken(refreshToken);
                    return ResponseEntity.ok(new AuthResponse(newAccessToken, email, role, "Token refreshed"));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        new AuthResponse(null, null, null, "Invalid or expired refresh token")
                ));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        String refreshToken = extractRefreshTokenFromCookie(request);
        if (refreshToken != null) {
            refreshTokenService.revokeRefreshToken(refreshToken);
        }
        authService.logout(response);
        return ResponseEntity.ok(new AuthResponse(null, null, null, "Logged out successfully"));
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}