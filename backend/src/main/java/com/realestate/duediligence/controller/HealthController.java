package com.realestate.duediligence.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Public health check used by deployment platforms and monitoring tools to
 * confirm the application is running. /api/health is already permitted in
 * SecurityConfig.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

	@GetMapping
	public ResponseEntity<Map<String, String>> health() {
		return ResponseEntity.ok(Map.of("status", "UP"));
	}
}