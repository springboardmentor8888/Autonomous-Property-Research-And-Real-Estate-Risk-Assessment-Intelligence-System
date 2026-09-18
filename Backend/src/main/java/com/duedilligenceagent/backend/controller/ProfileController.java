package com.duedilligenceagent.backend.controller;

import com.duedilligenceagent.backend.dto.ProfileResponse;
import com.duedilligenceagent.backend.dto.UpdateProfileRequest;
import com.duedilligenceagent.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Profile management endpoints.
 * All endpoints require authentication via JWT access token.
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * Get the authenticated user's profile.
     */
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        ProfileResponse profile = profileService.getProfile(userDetails);
        return ResponseEntity.ok(profile);
    }

    /**
     * Update the authenticated user's profile.
     */
    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {

        ProfileResponse profile = profileService.updateProfile(userDetails, request);
        return ResponseEntity.ok(profile);
    }
}
