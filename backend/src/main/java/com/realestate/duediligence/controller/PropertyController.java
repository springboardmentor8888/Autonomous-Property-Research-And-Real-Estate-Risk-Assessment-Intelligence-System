package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.AddressValidationRequest;
import com.realestate.duediligence.dto.AddressValidationResponse;
import com.realestate.duediligence.dto.ComparablePropertyResponse;
import com.realestate.duediligence.dto.CreatePropertyRequest;
import com.realestate.duediligence.dto.PropertyDetailsResponse;
import com.realestate.duediligence.dto.RiskAssessmentResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.service.PropertyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

	private final PropertyService propertyService;

	public PropertyController(PropertyService propertyService) {
		this.propertyService = propertyService;
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

	/**
	 * Creates a new property from a raw address: validates it via Geoapify, then
	 * saves it.
	 */
	@PostMapping
	public ResponseEntity<Property> createProperty(@RequestBody CreatePropertyRequest request) {
		Property property = propertyService.createProperty(request.getAddress(), request.getPropertyType());
		return ResponseEntity.status(HttpStatus.CREATED).body(property);
	}

	/**
	 * Returns the full due-diligence view of one property (all 7 modules).
	 */
	@GetMapping("/{id}")
	public ResponseEntity<PropertyDetailsResponse> getPropertyDetails(@PathVariable Long id) {
		PropertyDetailsResponse response = propertyService.getPropertyDetails(id);
		return ResponseEntity.ok(response);
	}

	// ---------- MILESTONE 3 ----------

	/**
	 * Returns the calculated risk assessment for a property, based on its existing
	 * tax, flood, zoning, permit, and environmental data.
	 */
	@GetMapping("/{id}/risk-assessment")
	public ResponseEntity<RiskAssessmentResponse> getRiskAssessment(@PathVariable Long id) {
		RiskAssessmentResponse response = propertyService.getRiskAssessment(id);
		return ResponseEntity.ok(response);
	}

	/**
	 * Returns simulated comparable (nearby) properties for price comparison and
	 * market context.
	 */
	@GetMapping("/{id}/comparables")
	public ResponseEntity<List<ComparablePropertyResponse>> getComparables(@PathVariable Long id) {
		List<ComparablePropertyResponse> response = propertyService.getComparables(id);
		return ResponseEntity.ok(response);
	}
}