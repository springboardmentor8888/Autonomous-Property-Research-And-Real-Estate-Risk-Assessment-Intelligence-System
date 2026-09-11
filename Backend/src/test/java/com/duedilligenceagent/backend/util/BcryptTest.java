package com.duedilligenceagent.backend.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Guards the seeded admin hash in {@code data.sql}: if this fails, the
 * pre-seeded {@code admin@example.com / Admin@123} login is broken.
 */
class BcryptTest {

    @Test
    void testAdminHashMatches() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String storedHash = "$2a$10$eaaUR9ZwAbVsnkdboHVSLO4.Z2n1G9tVECBK.g7lni7XlY6VgO4Ji";
        String password = "Admin@123";

        assertTrue(encoder.matches(password, storedHash),
                "data.sql admin hash must match Admin@123");
    }
}
