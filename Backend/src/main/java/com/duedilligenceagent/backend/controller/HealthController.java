package com.duedilligenceagent.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Liveness probe. Public on purpose so load balancers and the frontend
 * proxy can reach it without credentials.
 */
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public String health() {
        return "Backend is running";
    }
}