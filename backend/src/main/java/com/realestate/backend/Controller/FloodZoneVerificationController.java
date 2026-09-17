package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.FloodZoneVerification;
import com.realestate.backend.Service.FloodZoneVerificationService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.backend.Entity.Property;
import com.realestate.backend.Service.PropertyService;

import jakarta.validation.Valid;
@CrossOrigin(origins="http://localhost:5173")
@RestController
@RequestMapping("/api/flood-zone-verification")
public class FloodZoneVerificationController {

    private final FloodZoneVerificationService floodZoneVerificationService;

    public FloodZoneVerificationController(
            FloodZoneVerificationService floodZoneVerificationService) {
        this.floodZoneVerificationService = floodZoneVerificationService;
    }

    @PostMapping
    public ResponseEntity<FloodZoneVerification> createFloodZoneVerification(
            @RequestBody FloodZoneVerification floodZoneVerification) {

        return ResponseEntity.ok(
                floodZoneVerificationService
                        .createFloodZoneVerification(floodZoneVerification));
    }

    @GetMapping
    public ResponseEntity<List<FloodZoneVerification>>
            getAllFloodZoneVerifications() {

        return ResponseEntity.ok(
                floodZoneVerificationService
                        .getAllFloodZoneVerifications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FloodZoneVerification>
            getFloodZoneVerificationById(
                    @PathVariable Long id) {

        return ResponseEntity.ok(
                floodZoneVerificationService
                        .getFloodZoneVerificationById(id));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<FloodZoneVerification>>
            getFloodZoneVerificationsByPropertyId(
                    @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                floodZoneVerificationService
                        .getFloodZoneVerificationsByPropertyId(propertyId));
    }
    @PutMapping("/{id}")
    public ResponseEntity<FloodZoneVerification> updateFloodZoneVerification(
            @PathVariable Long id,
            @RequestBody FloodZoneVerification floodZoneVerification) {

        return ResponseEntity.ok(
                floodZoneVerificationService
                        .updateFloodZoneVerification(id, floodZoneVerification));
    }
}