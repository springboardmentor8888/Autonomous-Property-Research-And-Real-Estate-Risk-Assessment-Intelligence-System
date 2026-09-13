package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.AddressValidationRequest;
import com.realestate.duediligence.dto.AddressValidationResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.service.PropertyService;
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

	/**
	 * Test endpoint proving role-based access control works.
	 * Only users with the ADMINISTRATOR role can access this successfully.
	 */
	@GetMapping("/admin-check")
	@PreAuthorize("hasRole('ADMINISTRATOR')")
	public ResponseEntity<String> adminOnlyCheck() {
		return ResponseEntity.ok("You are an administrator — access granted.");
	}
}