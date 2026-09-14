package com.realestate.backend.controller;

import com.realestate.backend.dto.ApiResponse;
import com.realestate.backend.dto.PropertyHistoryDTO;
import com.realestate.backend.dto.PropertyRequestDTO;
import com.realestate.backend.dto.PropertyResponseDTO;
import com.realestate.backend.dto.PropertySearchCriteriaDTO;
import com.realestate.backend.service.PropertyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyController {

    private final PropertyService propertyService;

    @Autowired
    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PropertyResponseDTO>> createProperty(@Valid @RequestBody PropertyRequestDTO requestDTO) {
        PropertyResponseDTO created = propertyService.createProperty(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Property created successfully", created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponseDTO>> getPropertyById(@PathVariable Long id) {
        PropertyResponseDTO property = propertyService.getPropertyById(id);
        return ResponseEntity.ok(ApiResponse.success("Property retrieved successfully", property));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertyResponseDTO>>> getAllProperties() {
        List<PropertyResponseDTO> properties = propertyService.getAllProperties();
        return ResponseEntity.ok(ApiResponse.success("Fetched all properties", properties));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponseDTO>> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyRequestDTO requestDTO) {
        PropertyResponseDTO updated = propertyService.updateProperty(id, requestDTO);
        return ResponseEntity.ok(ApiResponse.success("Property updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.ok(ApiResponse.success("Property deleted successfully", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PropertyResponseDTO>>> searchProperties(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String zipCode,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minBedrooms,
            @RequestParam(required = false) Integer minBathrooms,
            @RequestParam(required = false) String status) {

        PropertySearchCriteriaDTO criteria = new PropertySearchCriteriaDTO();
        criteria.setQuery(query);
        criteria.setCity(city);
        criteria.setState(state);
        criteria.setZipCode(zipCode);
        criteria.setPropertyType(propertyType);
        criteria.setMinPrice(minPrice);
        criteria.setMaxPrice(maxPrice);
        criteria.setMinBedrooms(minBedrooms);
        criteria.setMinBathrooms(minBathrooms);
        criteria.setStatus(status);

        List<PropertyResponseDTO> results = propertyService.searchProperties(criteria);
        return ResponseEntity.ok(ApiResponse.success("Search completed with " + results.size() + " properties found", results));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<PropertyHistoryDTO>>> getPropertyHistory(@PathVariable Long id) {
        List<PropertyHistoryDTO> history = propertyService.getPropertyHistory(id);
        return ResponseEntity.ok(ApiResponse.success("Property history retrieved successfully", history));
    }

    @PostMapping("/{id}/history")
    public ResponseEntity<ApiResponse<PropertyHistoryDTO>> addPropertyHistory(
            @PathVariable Long id,
            @Valid @RequestBody PropertyHistoryDTO historyDTO) {
        PropertyHistoryDTO createdHistory = propertyService.addPropertyHistory(id, historyDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("History record added successfully", createdHistory));
    }
}
