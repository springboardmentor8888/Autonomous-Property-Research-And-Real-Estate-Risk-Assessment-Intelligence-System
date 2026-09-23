package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.ProfileResponse;
import com.duedilligenceagent.backend.dto.UpdateProfileRequest;
import com.duedilligenceagent.backend.entities.Role;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.entities.UserProfile;
import com.duedilligenceagent.backend.entities.enums.RoleName;
import com.duedilligenceagent.backend.exception.InvalidAuthRequestException;
import com.duedilligenceagent.backend.repositories.RoleRepository;
import com.duedilligenceagent.backend.repositories.UserProfileRepository;
import com.duedilligenceagent.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service for managing user profiles.
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final RoleRepository roleRepository;

    /**
     * Get the profile for the currently authenticated user.
     */
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidAuthRequestException("User not found"));

        UserProfile profile = profileRepository.findByUserId(user.getUserId())
                .orElseGet(() -> createDefaultProfile(user));

        return mapToResponse(user, profile);
    }

    /**
     * Update the profile for the currently authenticated user.
     */
    @Transactional
    public ProfileResponse updateProfile(UserDetails userDetails, UpdateProfileRequest request) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidAuthRequestException("User not found"));

        UserProfile profile = profileRepository.findByUserId(user.getUserId())
                .orElseGet(() -> createDefaultProfile(user));

        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setPhone(request.getPhone());
        profile.setJobTitle(request.getJobTitle());
        profile.setOrganization(request.getOrganization());
        profile.setProfilePicture(request.getProfilePicture());
        profile.setTimezone(request.getTimezone());
        profileRepository.save(profile);

        return mapToResponse(user, profile);
    }

    /**
     * Create a default profile for a user if one doesn't exist.
     */
    private UserProfile createDefaultProfile(User user) {
        UserProfile profile = UserProfile.builder()
                .userId(user.getUserId())
                .firstName("")
                .lastName("")
                .build();
        return profileRepository.save(profile);
    }

    /**
     * Map User and UserProfile to ProfileResponse.
     */
    private ProfileResponse mapToResponse(User user, UserProfile profile) {
        Role role = roleRepository.findById(user.getRoleId()).orElse(null);
        String roleName = role != null ? role.getName() : "UNKNOWN";

        return ProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .phone(profile.getPhone())
                .jobTitle(profile.getJobTitle())
                .organization(profile.getOrganization())
                .profilePicture(profile.getProfilePicture())
                .timezone(profile.getTimezone())
                .role(roleName)
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
