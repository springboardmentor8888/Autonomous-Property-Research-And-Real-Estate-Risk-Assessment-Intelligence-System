package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.dto.UserSummaryResponse;
import com.realestate.duediligence.entity.AuditLog;
import com.realestate.duediligence.repository.AuditLogRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.PropertyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Admin-only endpoints. The class-level @PreAuthorize means every
 * endpoint here requires the ADMINISTRATOR role.
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
		return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
	}

	@GetMapping("/users")
	public ResponseEntity<List<UserSummaryResponse>> getUsers() {
		List<UserSummaryResponse> users = userRepository.findAll().stream()
				.map(u -> new UserSummaryResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole()))
				.toList();
		return ResponseEntity.ok(users);
	}

	/**
	 * Aggregate platform statistics. Every figure is computed in the
	 * database or with a fixed number of bulk queries, so the cost does
	 * not grow with the number of properties or audit entries.
	 */
	@GetMapping("/dashboard")
	public ResponseEntity<DashboardStatsResponse> getDashboardStats() {

		long totalUsers = userRepository.count();
		long totalProperties = propertyRepository.count();
		long totalAuditEvents = auditLogRepository.count();

		long totalReportsGenerated = auditLogRepository.countByActionIn(
				List.of("REPORT_GENERATED_PDF", "REPORT_GENERATED_EXCEL"));

		Map<String, Long> riskLevelDistribution = propertyService.getRiskLevelDistribution();

		return ResponseEntity.ok(new DashboardStatsResponse(
				totalUsers, totalProperties, totalReportsGenerated, riskLevelDistribution, totalAuditEvents));
	}
}