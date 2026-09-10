package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.entities.RefreshToken;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.repositories.RefreshTokenRepository;
import com.duedilligenceagent.backend.repositories.UserRepository;
import com.duedilligenceagent.backend.security.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               UserRepository userRepository,
                               JwtService jwtService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public RefreshToken createRefreshToken(User user, String roleName) {
        // Revoke all existing refresh tokens for this user (token rotation)
        refreshTokenRepository.revokeAllForUser(user.getUserId());

        String refreshTokenValue = jwtService.generateRefreshToken(
                org.springframework.security.core.userdetails.User
                        .withUsername(user.getEmail())
                        .password(user.getPasswordHash())
                        .roles(roleName)
                        .disabled(!user.getIsActive())
                        .build()
        );

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setUserId(user.getUserId());
        refreshToken.setExpiresAt(LocalDateTime.now().plusNanos(jwtService.getRefreshTokenExpirationMs() * 1_000_000));

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public RefreshToken createRefreshTokenForRegistration(User user, String roleName) {
        String refreshTokenValue = jwtService.generateRefreshToken(
                org.springframework.security.core.userdetails.User
                        .withUsername(user.getEmail())
                        .password(user.getPasswordHash())
                        .roles(roleName)
                        .disabled(!user.getIsActive())
                        .build()
        );

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setUserId(user.getUserId());
        refreshToken.setExpiresAt(LocalDateTime.now().plusNanos(jwtService.getRefreshTokenExpirationMs() * 1_000_000));

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public Optional<String> refreshAccessToken(String refreshTokenValue, HttpServletResponse response) {
        // Find the refresh token in database
        Optional<RefreshToken> storedTokenOpt = refreshTokenRepository.findByToken(refreshTokenValue);

        if (storedTokenOpt.isEmpty()) {
            return Optional.empty();
        }

        RefreshToken storedToken = storedTokenOpt.get();

        // Check if token is valid
        if (!storedToken.isValid()) {
            // Clean up invalid token
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            return Optional.empty();
        }

        // Get user
        Optional<User> userOpt = userRepository.findById(storedToken.getUserId());
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        User user = userOpt.get();

        // Generate new access token
        String newAccessToken = jwtService.generateAccessToken(
                org.springframework.security.core.userdetails.User
                        .withUsername(user.getEmail())
                        .password(user.getPasswordHash())
                        .roles(user.getRole().getName())
                        .disabled(!user.getIsActive())
                        .build()
        );

        // Token rotation: revoke old refresh token and create new one
        String newRefreshTokenValue = jwtService.generateRefreshToken(
                org.springframework.security.core.userdetails.User
                        .withUsername(user.getEmail())
                        .password(user.getPasswordHash())
                        .roles(user.getRole().getName())
                        .disabled(!user.getIsActive())
                        .build()
        );

        storedToken.setRevoked(true);
        storedToken.setReplacedByToken(newRefreshTokenValue);
        refreshTokenRepository.save(storedToken);

        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setToken(newRefreshTokenValue);
        newRefreshToken.setUserId(user.getUserId());
        newRefreshToken.setExpiresAt(LocalDateTime.now().plusNanos(jwtService.getRefreshTokenExpirationMs() * 1_000_000));
        refreshTokenRepository.save(newRefreshToken);

        // Set new refresh token as HttpOnly cookie
        setRefreshTokenCookie(response, newRefreshTokenValue);

        return Optional.of(newAccessToken);
    }

    @Transactional
    public void revokeRefreshToken(String refreshTokenValue) {
        Optional<RefreshToken> storedTokenOpt = refreshTokenRepository.findByToken(refreshTokenValue);
        if (storedTokenOpt.isPresent()) {
            RefreshToken token = storedTokenOpt.get();
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        }
    }

    @Transactional
    public void revokeAllUserTokens(Long userId) {
        refreshTokenRepository.revokeAllForUser(userId);
    }

    public void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        // Path must cover both /api/auth/refresh and /api/auth/logout so the
        // cookie is actually sent when the client logs out (otherwise the
        // server never sees it and cannot revoke the token).
        cookie.setPath("/api/auth");
        cookie.setMaxAge((int) (jwtService.getRefreshTokenExpirationMs() / 1000)); // 7 days
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    public void clearAccessTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("access_token", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    public String extractEmailFromToken(String token) {
        return jwtService.extractUsername(token);
    }

    public String extractRoleFromToken(String token) {
        String roles = jwtService.extractRoles(token);
        if (roles != null && roles.startsWith("ROLE_")) {
            return roles.substring(5);
        }
        return roles;
    }
}