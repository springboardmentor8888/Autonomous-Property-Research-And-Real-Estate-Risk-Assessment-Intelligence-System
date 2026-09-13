package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.AddressValidationRequest;
import com.realestate.duediligence.dto.AddressValidationResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.service.PropertyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller class for handling HTTP requests related to properties.
 *
 * @RestController tells Spring that this class handles REST API requests
 * and that the return values will be sent as JSON responses.
 */
@RestController

/*
 * Base URL for all endpoints in this controller.
 *
 * Example:
 * http://localhost:8080/api/properties
 */
@RequestMapping("/api/properties")
public class PropertyController {

    /*
     * Service layer used to perform property-related business logic.
     */
    private final PropertyService propertyService;

    /**
     * Constructor injection.
     *
     * Spring automatically provides the PropertyService object
     * when creating this controller.
     */
    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    /**
     * Searches for properties using an address.
     *
     * HTTP request:
     * GET /api/properties/search?address=Hyderabad
     *
     * @RequestParam gets the "address" value from the URL.
     *
     * Example:
     * address = Hyderabad
     *
     * The request is passed to PropertyService, which then
     * communicates with PropertyRepository.
     */
    @GetMapping("/search")
    public ResponseEntity<List<Property>> search(
            @RequestParam String address) {

        /*
         * Call the service layer to search for properties
         * matching the given address.
         */
        List<Property> results =
                propertyService.searchByAddress(address);

        /*
         * Return HTTP 200 OK along with the list of properties.
         *
         * Spring automatically converts the List<Property>
         * into JSON.
         */
        return ResponseEntity.ok(results);
    }

    /**
     * Validates a property address using the Geoapify Geocoding API
     * (called server-side, so the API key is never exposed to the browser).
     *
     * HTTP request:
     * POST /api/properties/validate-address
     *
     * Request body (JSON):
     * { "address": "1600 Pennsylvania Avenue NW, Washington, D.C. 20500" }
     *
     * Response body (JSON) when found:
     * {
     *   "valid": true,
     *   "formattedAddress": "...",
     *   "city": "Washington",
     *   "state": "District of Columbia",
     *   "postalCode": "20500",
     *   "country": "United States",
     *   "latitude": 38.897699,
     *   "longitude": -77.036530
     * }
     *
     * Response body when NOT found:
     * { "valid": false }
     *
     * @Valid triggers bean-validation on the request body (e.g. @NotBlank).
     * @RequestBody deserialises the incoming JSON into AddressValidationRequest.
     */
    @PostMapping("/validate-address")
    public ResponseEntity<AddressValidationResponse> validateAddress(
            @Valid @RequestBody AddressValidationRequest request) {

        AddressValidationResponse response =
                propertyService.validateAddress(request.getAddress());

        return ResponseEntity.ok(response);
    }
}
