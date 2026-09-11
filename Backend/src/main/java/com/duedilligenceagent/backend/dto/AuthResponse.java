package com.duedilligenceagent.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Body returned by every {@code /api/auth/*} endpoint.
 * <p>
 * Only the short-lived {@code accessToken} travels in the response body —
 * the refresh token is delivered exclusively as an HttpOnly cookie, so it
 * can never be read by (or leaked to) browser JavaScript.
 */
@Getter
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;

    private String email;

    private String role;

    private String message;
}