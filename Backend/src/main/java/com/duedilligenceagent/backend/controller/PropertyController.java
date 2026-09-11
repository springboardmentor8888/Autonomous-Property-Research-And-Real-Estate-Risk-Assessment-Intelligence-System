package com.duedilligenceagent.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.dto.Property.PropertySearchApiResponse;
import com.duedilligenceagent.backend.dto.PropertyResponse;
import com.duedilligenceagent.backend.service.PropertySearchService;
import com.duedilligenceagent.backend.service.PropertyService;

/**
 * Property endpoints — search/CRUD, all requiring a valid access token.
 */
@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;
    private final PropertySearchService propertySearchService;

    public PropertyController(PropertyService propertyService,
                              PropertySearchService propertySearchService) {
        this.propertyService = propertyService;
        this.propertySearchService = propertySearchService;
    }

    @GetMapping
    public ResponseEntity<List<PropertyResponse>> getAllProperties() {
        return ResponseEntity.ok(
                propertyService.getAllProperties()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getPropertyById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                propertyService.getPropertyById(id)
        );
    }

    /**
     * Address-based search backed by Google Geocoding v4 (+ Places details
     * fallback for the property type). Returns a stable JSON envelope:
     * <pre>
     * { "success": bool, "message": string, "data": { "status": "VALID|INVALID|ERROR", ... } }
     * </pre>
     * The frontend branches on {@code data.status}. On INVALID/ERROR the
     * top-level {@code message} is the user-facing copy.
     */
    @PostMapping("/search")
    public ResponseEntity<PropertySearchApiResponse> searchByAddress(
            @RequestBody PropertyDetailsRequest request) {
        return ResponseEntity.ok(propertySearchService.searchByAddress(request));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PropertyResponse>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String propertyType) {

        if (city != null && !city.isBlank()) {
            return ResponseEntity.ok(
                    propertyService.searchByCity(city)
            );
        }

        if (state != null && !state.isBlank()) {
            return ResponseEntity.ok(
                    propertyService.searchByState(state)
            );
        }

        if (propertyType != null && !propertyType.isBlank()) {
            return ResponseEntity.ok(
                    propertyService.searchByPropertyType(propertyType)
            );
        }

        return ResponseEntity.ok(
                propertyService.getAllProperties()
        );
    }
}