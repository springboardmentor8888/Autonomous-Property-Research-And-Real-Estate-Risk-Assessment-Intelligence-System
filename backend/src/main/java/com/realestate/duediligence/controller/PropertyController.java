package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.*;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.service.AuditService;
import com.realestate.duediligence.service.NotificationService;
import com.realestate.duediligence.service.PropertyService;
import com.realestate.duediligence.service.ReportService;
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
		List<Property> results = propertyService.searchByAddress(address);
		return ResponseEntity.ok(results);
	}

	@PostMapping("/validate-address")
	public ResponseEntity<AddressValidationResponse> validateAddress(@RequestBody AddressValidationRequest request) {
		AddressValidationResponse response = propertyService.validateAddress(request.getAddress());
		return ResponseEntity.ok(response);
	}

	@GetMapping("/admin-check")
	@PreAuthorize("hasRole('ADMINISTRATOR')")
	public ResponseEntity<String> adminOnlyCheck() {
		return ResponseEntity.ok("You are an administrator - access granted.");
	}

	// ---------- MILESTONE 2 ----------

	@PostMapping
	public ResponseEntity<Property> createProperty(@RequestBody CreatePropertyRequest request) {
		Property property = propertyService.createProperty(request.getAddress(), request.getPropertyType());

		auditService.log(currentUserEmail(), "CREATE_PROPERTY", "propertyId=" + property.getId());

		return ResponseEntity.status(HttpStatus.CREATED).body(property);
	}

	@GetMapping("/{id}")
	public ResponseEntity<PropertyDetailsResponse> getPropertyDetails(@PathVariable Long id) {
		PropertyDetailsResponse response = propertyService.getPropertyDetails(id);
		return ResponseEntity.ok(response);
	}

	// ---------- MILESTONE 3 ----------

	@GetMapping("/{id}/risk-assessment")
	public ResponseEntity<RiskAssessmentResponse> getRiskAssessment(@PathVariable Long id) {
		RiskAssessmentResponse response = propertyService.getRiskAssessment(id);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{id}/comparables")
	public ResponseEntity<List<ComparablePropertyResponse>> getComparables(@PathVariable Long id) {
		List<ComparablePropertyResponse> response = propertyService.getComparables(id);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{id}/report/pdf")
	public ResponseEntity<byte[]> getPdfReport(@PathVariable Long id) {
		PropertyDetailsResponse details = propertyService.getPropertyDetails(id);
		RiskAssessmentResponse risk = propertyService.getRiskAssessment(id);
		byte[] pdfBytes = reportService.generatePdfReport(details, risk);

		notifyReportReady(id, details.getAddress());
		auditService.log(currentUserEmail(), "REPORT_GENERATED_PDF", "propertyId=" + id);

		return ResponseEntity
				.ok().contentType(MediaType.APPLICATION_PDF).header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition
						.attachment().filename("due-diligence-report-" + id + ".pdf").build().toString())
				.body(pdfBytes);
	}

	@GetMapping("/{id}/report/excel")
	public ResponseEntity<byte[]> getExcelReport(@PathVariable Long id) {
		PropertyDetailsResponse details = propertyService.getPropertyDetails(id);
		RiskAssessmentResponse risk = propertyService.getRiskAssessment(id);
		byte[] excelBytes = reportService.generateExcelReport(details, risk);

		notifyReportReady(id, details.getAddress());
		auditService.log(currentUserEmail(), "REPORT_GENERATED_EXCEL", "propertyId=" + id);

		return ResponseEntity.ok()
				.contentType(
						MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
				.header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
						.filename("due-diligence-report-" + id + ".xlsx").build().toString())
				.body(excelBytes);
	}

	private void notifyReportReady(Long propertyId, String propertyAddress) {
		String userEmail = currentUserEmail();
		notificationService.sendReportReadyNotification(userEmail, propertyId, propertyAddress);
	}

	private String currentUserEmail() {
		return SecurityContextHolder.getContext().getAuthentication().getName();
	}
}