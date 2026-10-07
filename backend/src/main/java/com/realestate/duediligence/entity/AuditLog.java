package com.realestate.duediligence.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Records a single significant user action — login, report generation, property
 * creation, etc. — for audit/history purposes, per our SRS's Audit module
 * requirement.
 */
@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String userEmail;

	@Column(nullable = false)
	private String action;

	// Optional extra context, e.g. "propertyId=2"
	@Column(nullable = true)
	private String details;

	@Column(nullable = false)
	private LocalDateTime timestamp;
}