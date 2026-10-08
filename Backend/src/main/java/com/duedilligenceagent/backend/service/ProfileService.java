package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.ProfileResponse;
import com.duedilligenceagent.backend.dto.UpdateProfileRequest;
import com.duedilligenceagent.backend.entities.Role;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.entities.UserProfile;
import com.duedilligenceagent.backend.entities.enums.RoleName;
import com.duedilligenceagent.backend.exception.InvalidAuthRequestException;
import com.duedilligenceagent.backend.exception.ProfileIncompleteException;
import com.duedilligenceagent.backend.repositories.RoleRepository;
import com.duedilligenceagent.backend.repositories.UserProfileRepository;
import com.duedilligenceagent.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
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

    /**
     * Guards actions that require a completed profile (property search):
     * throws {@link ProfileIncompleteException} naming the missing fields
     * when the caller's profile is incomplete. Administrators are exempt —
     * the consumer profile flow does not apply to them.
     */
    public void requireCompleteProfile(UserDetails userDetails) {
        if (userDetails == null) {
            return;
        }
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMINISTRATOR".equals(a.getAuthority()));
        if (isAdmin) {
            return;
        }

        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return;
        }
        UserProfile profile = profileRepository.findByUserId(user.getUserId()).orElse(null);
        if (profile == null) {
            throw new ProfileIncompleteException("first name, last name, phone");
        }

        List<String> missing = new ArrayList<>();
        if (isBlank(profile.getFirstName())) {
            missing.add("first name");
        }
        if (isBlank(profile.getLastName())) {
            missing.add("last name");
        }
        if (isBlank(profile.getPhone())) {
            missing.add("phone");
        }
        if (!missing.isEmpty()) {
            throw new ProfileIncompleteException(String.join(", ", missing));
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
