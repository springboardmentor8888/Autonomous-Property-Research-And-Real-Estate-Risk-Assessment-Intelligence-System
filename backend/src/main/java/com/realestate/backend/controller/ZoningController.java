package com.realestate.backend.controller;

import com.realestate.backend.entity.Zoning;
import com.realestate.backend.service.ZoningService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zoning")
public class ZoningController {

private final ZoningService zoningService;

public ZoningController(ZoningService zoningService) {
    this.zoningService = zoningService;
}

@PostMapping("/property/{propertyId}")
public ResponseEntity<Zoning> createZoning(
        @PathVariable Long propertyId,
        @RequestBody Zoning zoning) {

    return ResponseEntity.ok(
            zoningService.createZoning(propertyId, zoning)
    );
}

@GetMapping
public ResponseEntity<List<Zoning>> getAllZonings() {

    return ResponseEntity.ok(
            zoningService.getAllZonings()
    );
}

@GetMapping("/{id}")
public ResponseEntity<Zoning> getZoningById(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            zoningService.getZoningById(id)
    );
}

@GetMapping("/property/{propertyId}")
public ResponseEntity<List<Zoning>> getZoningsByPropertyId(
        @PathVariable Long propertyId) {

    return ResponseEntity.ok(
            zoningService.getZoningsByPropertyId(propertyId)
    );
}

@PutMapping("/{id}")
public ResponseEntity<Zoning> updateZoning(
        @PathVariable Long id,
        @RequestBody Zoning zoning) {

    return ResponseEntity.ok(
            zoningService.updateZoning(id, zoning)
    );
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteZoning(
        @PathVariable Long id) {

    zoningService.deleteZoning(id);

    return ResponseEntity.noContent().build();
}

}