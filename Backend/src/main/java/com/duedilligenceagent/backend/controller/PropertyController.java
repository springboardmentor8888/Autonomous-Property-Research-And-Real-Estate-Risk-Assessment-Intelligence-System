package com.duedilligenceagent.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.duedilligenceagent.backend.dto.PropertyResponse;
import com.duedilligenceagent.backend.service.PropertyService;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
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