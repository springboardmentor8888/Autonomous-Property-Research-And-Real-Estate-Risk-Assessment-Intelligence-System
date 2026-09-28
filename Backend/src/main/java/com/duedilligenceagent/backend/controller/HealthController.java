package com.duedilligenceagent.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Liveness probe. Public on purpose so load balancers and the frontend
 * proxy can reach it without credentials.
 */
@RestController
public class HealthController {

    @GetMapping("/")
    public String root() {
        return "Real Estate Due Diligence Agent backend is running. Use /api/health or /swagger-ui.html.";
    }

    @GetMapping("/api/health")
    public String health() {
        return "Backend is running";
    }
}