package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.PropertyTaxHistory;
import com.realestate.backend.Service.PropertyTaxHistoryService;

@RestController
@RequestMapping("/api/property-tax-history")
public class PropertyTaxHistoryController {

    private final PropertyTaxHistoryService propertyTaxHistoryService;

    public PropertyTaxHistoryController(
            PropertyTaxHistoryService propertyTaxHistoryService) {
        this.propertyTaxHistoryService = propertyTaxHistoryService;
    }

    @PostMapping
    public ResponseEntity<PropertyTaxHistory> createTaxHistory(
            @RequestBody PropertyTaxHistory taxHistory) {

        return ResponseEntity.ok(
                propertyTaxHistoryService.createTaxHistory(taxHistory));
    }

    @GetMapping
    public ResponseEntity<List<PropertyTaxHistory>> getAllTaxHistory() {

        return ResponseEntity.ok(
                propertyTaxHistoryService.getAllTaxHistory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyTaxHistory> getTaxHistoryById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                propertyTaxHistoryService.getTaxHistoryById(id));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<PropertyTaxHistory>> getTaxHistoryByPropertyId(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                propertyTaxHistoryService
                        .getTaxHistoryByPropertyId(propertyId));
    }
}