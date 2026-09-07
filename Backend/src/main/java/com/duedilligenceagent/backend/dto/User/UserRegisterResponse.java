package com.duedilligenceagent.backend.dto.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Outbound payload returned after a successful registration.
 * <p>
 * Intentionally does NOT echo the password or the password hash back to
 * the client. The security layer will likely replace the raw {@code userId}
 * with a JWT in a later iteration — the field is named {@code userId} for
 * compatibility with the existing {@code UserController}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisterResponse {

    private String userId;

    private String email;

    private String fullName;

    private LocalDateTime createdAt;
}
