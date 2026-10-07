package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.AuditLog;
import com.realestate.duediligence.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Records significant user actions for audit/history purposes, per our SRS's
 * Audit module (Activity Logs, Report History, User Activity).
 */
@Service
public class AuditService {

	private final AuditLogRepository auditLogRepository;

	public AuditService(AuditLogRepository auditLogRepository) {
		this.auditLogRepository = auditLogRepository;
	}

	/**
	 * Records one audit entry. Called from wherever a significant action happens
	 * (login, report generated, property created, etc.)
	 */
	public void log(String userEmail, String action, String details) {
		AuditLog entry = new AuditLog();
		entry.setUserEmail(userEmail);
		entry.setAction(action);
		entry.setDetails(details);
		entry.setTimestamp(LocalDateTime.now());

		auditLogRepository.save(entry);
	}
}