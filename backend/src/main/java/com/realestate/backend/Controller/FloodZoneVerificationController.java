package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.FloodZoneVerification;
import com.realestate.backend.Service.FloodZoneVerificationService;

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
}