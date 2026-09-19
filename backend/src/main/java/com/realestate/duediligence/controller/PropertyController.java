package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.AddressValidationRequest;
import com.realestate.duediligence.dto.AddressValidationResponse;
import com.realestate.duediligence.dto.PropertyDetailsResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.service.PropertyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller responsible for handling property-related API requests.
 *
 * Base URL:
 * /api/properties
 *
 * This controller receives HTTP requests from the frontend/client,
 * calls the appropriate method in PropertyService, and returns
 * the response to the client.
 *
 * Flow:
 *
 * Client
 *   ↓
 * PropertyController
 *   ↓
 * PropertyService
 *   ↓
 * Repository / External API
 *   ↓
 * PropertyController
 *   ↓
 * HTTP Response
 */
@RestController
@RequestMapping("/api/properties")
public class PropertyController {

	/*
	 * Service layer responsible for the actual property business logic.
	 *
	 * The controller should mainly handle HTTP-related tasks such as:
	 * - Receiving requests
	 * - Reading request parameters/body
	 * - Calling the service
	 * - Returning HTTP responses
	 *
	 * Business logic is kept inside PropertyService instead of
	 * putting it directly in the controller.
	 */
	private final PropertyService propertyService;

	/**
	 * Constructor injection.
	 *
	 * Spring automatically provides the PropertyService bean.
	 *
	 * Constructor injection is preferred because the dependency is
	 * required for this controller to work.
	 */
	public PropertyController(PropertyService propertyService) {
		this.propertyService = propertyService;
	}

	/**
	 * Searches properties based on the provided address.
	 *
	 * HTTP Method: GET
	 * Endpoint: /api/properties/search?address=<address>
	 *
	 * Example:
	 * GET /api/properties/search?address=Hyderabad
	 *
	 * @RequestParam extracts the "address" value from the URL.
	 *
	 * The controller passes the address to the service layer,
	 * which performs the actual search logic.
	 */
	@GetMapping("/search")
	public ResponseEntity<List<Property>> search(@RequestParam String address) {

		// Call the service layer to search properties by address.
		List<Property> results = propertyService.searchByAddress(address);

		// Return the search results with HTTP status 200 (OK).
		return ResponseEntity.ok(results);
	}

	/**
	 * Validates a property address using the address-validation logic
	 * implemented in the service layer.
	 *
	 * HTTP Method: POST
	 * Endpoint: /api/properties/validate-address
	 *
	 * The address is sent inside the HTTP request body as JSON.
	 *
	 * Example request:
	 *
	 * {
	 *     "address": "Hyderabad, Telangana"
	 * }
	 *
	 * @RequestBody converts the incoming JSON request body into
	 * an AddressValidationRequest Java object.
	 */
	@PostMapping("/validate-address")
	public ResponseEntity<AddressValidationResponse> validateAddress(
			@RequestBody AddressValidationRequest request) {

		/*
		 * Extract the address from the DTO and pass it to the service.
		 *
		 * The service contains the actual address-validation logic,
		 * such as communicating with the external geocoding/address
		 * validation API.
		 */
		AddressValidationResponse response =
				propertyService.validateAddress(request.getAddress());

		// Return the validation result with HTTP status 200 (OK).
		return ResponseEntity.ok(response);
	}

	/**
	 * Test endpoint proving role-based access control works.
	 *
	 * HTTP Method: GET
	 * Endpoint: /api/properties/admin-check
	 *
	 * Only users having the ADMINISTRATOR role are allowed to
	 * successfully access this endpoint.
	 *
	 * @PreAuthorize performs method-level authorization before
	 * the controller method is executed.
	 *
	 * If the authenticated user's role is not ADMINISTRATOR,
	 * Spring Security prevents access to this method.
	 */
	@GetMapping("/admin-check")
	@PreAuthorize("hasRole('ADMINISTRATOR')")
	public ResponseEntity<String> adminOnlyCheck() {

		// This message is returned only after authorization succeeds.
		return ResponseEntity.ok(
				"You are an administrator — access granted.");
	}
	
    /**
     * Returns the full due-diligence view of a single property —
     * ownership, tax history, zoning, flood zone, and permits.
     * Generates simulated data on first request if none exists yet.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PropertyDetailsResponse> getPropertyDetails(@PathVariable Long id) {
        PropertyDetailsResponse response = propertyService.getPropertyDetails(id);
        return ResponseEntity.ok(response);
    }
}