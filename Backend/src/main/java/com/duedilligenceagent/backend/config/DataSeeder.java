package com.duedilligenceagent.backend.config;

import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds a deterministic test account on startup. The H2 in-memory DB
 * drops and recreates the schema on every boot (ddl-auto=create-drop),
 * so without this seeder there is no way to log in during local dev.
 * <p>
 * Credentials (also documented in {@code TESTING.md}):
 * <pre>
 *   email:    test@example.com
 *   password: Test@1234
 * </pre>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedUserIfMissing("test@example.com", "Test@1234", 1L);
        seedUserIfMissing("admin@example.com", "Admin@1234", 2L);
    }

    private void seedUserIfMissing(String email, String rawPassword, Long roleId) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .roleId(roleId)
                .isActive(true)
                .build();
        userRepository.save(user);
        log.info("Seeded user: {} (roleId={})", email, roleId);
    }
}
