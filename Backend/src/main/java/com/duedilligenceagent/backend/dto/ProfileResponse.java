package com.duedilligenceagent.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response DTO for user profile information.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {

    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String jobTitle;
    private String organization;
    private String profilePicture;
    private String timezone;
    private String role;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    public String getFullName() {
        return (firstName != null ? firstName : "") + (lastName != null ? " " + lastName : "");
    }

    public String getInitials() {
        String fn = firstName != null && !firstName.isEmpty() ? firstName.substring(0, 1) : "";
        String ln = lastName != null && !lastName.isEmpty() ? lastName.substring(0, 1) : "";
        return (fn + ln).toUpperCase();
    }
}
