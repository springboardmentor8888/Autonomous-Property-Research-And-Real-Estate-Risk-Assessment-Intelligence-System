package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.*;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.service.AuditService;
import com.realestate.duediligence.service.NotificationService;
import com.realestate.duediligence.service.PropertyService;
import com.realestate.duediligence.service.ReportService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

	private static final Logger log = LoggerFactory.getLogger(PropertyController.class);

	private final PropertyService propertyService;
	private final ReportService reportService;
	private final NotificationService notificationService;
	private final AuditService auditService;

	public PropertyController(PropertyService propertyService, ReportService reportService,
			NotificationService notificationService, AuditService auditService) {
		this.propertyService = propertyService;
		this.reportService = reportService;
		this.notificationService = notificationService;
		this.auditService = auditService;
	}

	// ---------- MILESTONE 1 ----------

	@GetMapping("/search")
	public ResponseEntity<List<Property>> search(@RequestParam String address) {
		return ResponseEntity.ok(propertyService.searchByAddress(address));
	}

	@PostMapping("/validate-address")
	public ResponseEntity<AddressValidationResponse> validateAddress(
			@Valid @RequestBody AddressValidationRequest request) {
		return ResponseEntity.ok(propertyService.validateAddress(request.getAddress()));
	}

	@GetMapping("/admin-check")
	@PreAuthorize("hasRole('ADMINISTRATOR')")
	public ResponseEntity<String> adminOnlyCheck() {
		return ResponseEntity.ok("You are an administrator - access granted.");
	}

	// ---------- MILESTONE 2 ----------

	@PostMapping
	public ResponseEntity<Property> createProperty(@Valid @RequestBody CreatePropertyRequest request) {
		Property property = propertyService.createProperty(request.getAddress(), request.getPropertyType());
		recordAudit("CREATE_PROPERTY", "propertyId=" + property.getId());
		return ResponseEntity.status(HttpStatus.CREATED).body(property);
	}

	@GetMapping("/{id}")
	public ResponseEntity<PropertyDetailsResponse> getPropertyDetails(@PathVariable Long id) {
		return ResponseEntity.ok(propertyService.getPropertyDetails(id));
	}

	// ---------- MILESTONE 3 ----------

	@GetMapping("/{id}/risk-assessment")
	public ResponseEntity<RiskAssessmentResponse> getRiskAssessment(@PathVariable Long id) {
		return ResponseEntity.ok(propertyService.getRiskAssessment(id));
	}

	@GetMapping("/{id}/comparables")
	public ResponseEntity<List<ComparablePropertyResponse>> getComparables(@PathVariable Long id) {
		return ResponseEntity.ok(propertyService.getComparables(id));
	}

	@GetMapping("/{id}/report/pdf")
	public ResponseEntity<byte[]> getPdfReport(@PathVariable Long id) {
		PropertyDetailsResponse details = propertyService.getPropertyDetails(id);
		RiskAssessmentResponse risk = propertyService.getRiskAssessment(id);
		byte[] pdfBytes = reportService.generatePdfReport(details, risk);

		sendReportEmail(id, details.getAddress());
		recordAudit("REPORT_GENERATED_PDF", "propertyId=" + id);

		return ResponseEntity.ok()
				.contentType(MediaType.APPLICATION_PDF)
				.header(HttpHeaders.CONTENT_DISPOSITION,
						ContentDisposition.attachment().filename("due-diligence-report-" + id + ".pdf").build().toString())
				.body(pdfBytes);
	}

	@GetMapping("/{id}/report/excel")
	public ResponseEntity<byte[]> getExcelReport(@PathVariable Long id) {
		PropertyDetailsResponse details = propertyService.getPropertyDetails(id);
		RiskAssessmentResponse risk = propertyService.getRiskAssessment(id);
		byte[] excelBytes = reportService.generateExcelReport(details, risk);

		sendReportEmail(id, details.getAddress());
		recordAudit("REPORT_GENERATED_EXCEL", "propertyId=" + id);

		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
				.header(HttpHeaders.CONTENT_DISPOSITION,
						ContentDisposition.attachment().filename("due-diligence-report-" + id + ".xlsx").build().toString())
				.body(excelBytes);
	}

	private void sendReportEmail(Long propertyId, String propertyAddress) {
		try {
			notificationService.sendReportReadyNotification(currentUserEmail(), propertyId, propertyAddress);
		} catch (Exception e) {
			log.warn("Report email could not be sent for property {}: {}", propertyId, e.getMessage());
		}
	}

	private void recordAudit(String action, String details) {
		try {
			auditService.log(currentUserEmail(), action, details);
		} catch (Exception e) {
			log.warn("Audit entry '{}' could not be saved: {}", action, e.getMessage());
		}
	}

	private String currentUserEmail() {
		return SecurityContextHolder.getContext().getAuthentication().getName();
	}
}