package com.duedilligenceagent.backend.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

class BcryptTest {

    @Test
    void testAdminHashMatches() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String storedHash = "$2a$10$eaaUR9ZwAbVsnkdboHVSLO4.Z2n1G9tVECBK.g7lni7XlY6VgO4Ji";
        String password = "Admin@123";
        
        System.out.println("Testing password: " + password);
        System.out.println("Stored hash: " + storedHash);
        boolean matches = encoder.matches(password, storedHash);
        System.out.println("Matches: " + matches);
        
        assertTrue(matches, "Hash should match Admin@123");
    }
}
