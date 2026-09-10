package com.duedilligenceagent.backend.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class GenerateHash {

    @Test
    void generateAdminHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "Admin@123";
        String hash = encoder.encode(password);
        System.out.println("Hash for '" + password + "': " + hash);
        System.out.println("Verification: " + encoder.matches(password, hash));
    }
}
