package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.PropertyValueHistory;
import com.realestate.backend.Service.PropertyValueHistoryService;

@RestController
@RequestMapping("/api/property-value-history")
public class PropertyValueHistoryController {

    private final PropertyValueHistoryService propertyValueHistoryService;

    public PropertyValueHistoryController(
            PropertyValueHistoryService propertyValueHistoryService) {

        this.propertyValueHistoryService =
                propertyValueHistoryService;
    }

    @PostMapping
    public ResponseEntity<PropertyValueHistory> createValueHistory(
            @RequestBody PropertyValueHistory history) {

        return ResponseEntity.ok(
                propertyValueHistoryService
                        .createValueHistory(history));
    }

    @GetMapping
    public ResponseEntity<List<PropertyValueHistory>> getAllValueHistory() {

        return ResponseEntity.ok(
                propertyValueHistoryService
                        .getAllValueHistory());
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<PropertyValueHistory>> getValueHistoryByPropertyId(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                propertyValueHistoryService
                        .getValueHistoryByPropertyId(propertyId));
    }
}