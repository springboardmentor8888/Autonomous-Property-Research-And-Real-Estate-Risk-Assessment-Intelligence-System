package com.realestate.duediligence.controller;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.entity.AuditLog;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.RiskLevel;
import com.realestate.duediligence.repository.AuditLogRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.PropertyService;

/**
 * Admin-only endpoints — matches our api-contract.md's /api/admin/* paths
 * planned back in Milestone 1. Class-level @PreAuthorize means every endpoint
 * here requires the ADMINISTRATOR role automatically.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminController {

	private final AuditLogRepository auditLogRepository;
	private final UserRepository userRepository;
	private final PropertyRepository propertyRepository;
	private final PropertyService propertyService;

	public AdminController(AuditLogRepository auditLogRepository, UserRepository userRepository,
			PropertyRepository propertyRepository, PropertyService propertyService) {
		this.auditLogRepository = auditLogRepository;
		this.userRepository = userRepository;
		this.propertyRepository = propertyRepository;
		this.propertyService = propertyService;
	}

	@GetMapping("/audit-logs")
	public ResponseEntity<List<AuditLog>> getAuditLogs() {
		List<AuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc();
		return ResponseEntity.ok(logs);
	}

	/**
	 * Returns aggregate platform statistics for the admin dashboard: total users,
	 * properties, reports generated, risk level distribution across all properties,
	 * and total audit events.
	 */
	@GetMapping("/dashboard")
	public ResponseEntity<DashboardStatsResponse> getDashboardStats() {

		long totalUsers = userRepository.count();
		long totalProperties = propertyRepository.count();
		long totalAuditEvents = auditLogRepository.count();

		long totalReportsGenerated = auditLogRepository.findAllByOrderByTimestampDesc().stream()
				.filter(log -> log.getAction().equals("REPORT_GENERATED_PDF")
						|| log.getAction().equals("REPORT_GENERATED_EXCEL"))
				.count();

//		Map<String, Long> riskLevelDistribution = new EnumMap<>(RiskLevel.class).entrySet().stream()
//				.collect(java.util.stream.Collectors.toMap(e -> e.getKey().toString(), e -> 0L, (a, b) -> a,
//						java.util.LinkedHashMap::new));
		// Initialize all three levels at zero so the response always shows
		// LOW/MEDIUM/HIGH even if none exist yet.
		Map<String, Long> riskLevelDistribution = new java.util.LinkedHashMap<>();
		riskLevelDistribution.put("LOW", 0L);
		riskLevelDistribution.put("MEDIUM", 0L);
		riskLevelDistribution.put("HIGH", 0L);

		List<Property> allProperties = propertyRepository.findAll();
		for (Property property : allProperties) {
			try {
				RiskLevel level = propertyService.getRiskAssessment(property.getId()).getOverallRiskLevel();
				riskLevelDistribution.merge(level.toString(), 1L, Long::sum);
			} catch (Exception ignored) {
				// Skip properties that somehow fail risk assessment rather than
				// failing the whole dashboard for one bad record.
			}
		}

		return ResponseEntity.ok(new DashboardStatsResponse(totalUsers, totalProperties, totalReportsGenerated,
				riskLevelDistribution, totalAuditEvents));
	}
}