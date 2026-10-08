package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.entities.UserProfile;
import com.duedilligenceagent.backend.exception.ProfileIncompleteException;
import com.duedilligenceagent.backend.repositories.RoleRepository;
import com.duedilligenceagent.backend.repositories.UserProfileRepository;
import com.duedilligenceagent.backend.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Verifies the profile-completion guard that gates property search: the
 * caller's profile must carry a first name, last name and phone, and
 * administrators are exempt from the consumer profile flow.
 */
@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserProfileRepository profileRepository;
    @Mock private RoleRepository roleRepository;

    @InjectMocks private ProfileService service;

    private static UserDetails principal(String email, String... roles) {
        return org.springframework.security.core.userdetails.User
                .withUsername(email).password("x").roles(roles).build();
    }

    private static User user(long id, String email) {
        User user = new User();
        user.setUserId(id);
        user.setEmail(email);
        return user;
    }

    @Test
    void passesWhenProfileIsComplete() {
        when(userRepository.findByEmail("u@x.com"))
                .thenReturn(Optional.of(user(1L, "u@x.com")));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(
                UserProfile.builder().userId(1L)
                        .firstName("Ada").lastName("Lovelace").phone("9876543210")
                        .build()));

        assertThatCode(() -> service.requireCompleteProfile(principal("u@x.com", "BUYER")))
                .doesNotThrowAnyException();
    }

    @Test
    void throwsNamingMissingPhone() {
        when(userRepository.findByEmail("u@x.com"))
                .thenReturn(Optional.of(user(1L, "u@x.com")));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(
                UserProfile.builder().userId(1L)
                        .firstName("Ada").lastName("Lovelace")
                        .build()));

        assertThatThrownBy(() -> service.requireCompleteProfile(principal("u@x.com", "BUYER")))
                .isInstanceOf(ProfileIncompleteException.class)
                .hasMessageContaining("phone")
                .hasMessageContaining("searching");
    }

    @Test
    void throwsNamingEveryMissingFieldWhenProfileIsEmpty() {
        when(userRepository.findByEmail("u@x.com"))
                .thenReturn(Optional.of(user(1L, "u@x.com")));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(
                UserProfile.builder().userId(1L).firstName("").lastName("").build()));

        assertThatThrownBy(() -> service.requireCompleteProfile(principal("u@x.com", "BUYER")))
                .isInstanceOf(ProfileIncompleteException.class)
                .hasMessageContaining("first name")
                .hasMessageContaining("last name")
                .hasMessageContaining("phone");
    }

    @Test
    void throwsWhenNoProfileRowExists() {
        when(userRepository.findByEmail("u@x.com"))
                .thenReturn(Optional.of(user(1L, "u@x.com")));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.requireCompleteProfile(principal("u@x.com", "BUYER")))
                .isInstanceOf(ProfileIncompleteException.class)
                .hasMessageContaining("first name, last name, phone");
    }

    @Test
    void administratorsAreExempt() {
        // No repository stubs: the admin short-circuits before any lookup.
        assertThatCode(() -> service.requireCompleteProfile(principal("a@x.com", "ADMINISTRATOR")))
                .doesNotThrowAnyException();
    }

    @Test
    void nullPrincipalIsIgnored() {
        assertThatCode(() -> service.requireCompleteProfile(null))
                .doesNotThrowAnyException();
    }
}
