package com.realestate.backend.controller;

import com.realestate.backend.entity.Ownership;
import com.realestate.backend.service.OwnershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ownership")
public class OwnershipController {

private final OwnershipService ownershipService;

public OwnershipController(OwnershipService ownershipService) {
    this.ownershipService = ownershipService;
}

@PostMapping
public ResponseEntity<Ownership> createOwnership(@RequestBody Ownership ownership) {
    return ResponseEntity.ok(ownershipService.createOwnership(ownership));
}

@GetMapping("/{id}")
public ResponseEntity<Ownership> getOwnershipById(@PathVariable Long id) {
    return ResponseEntity.ok(ownershipService.getOwnershipById(id));
}

@GetMapping
public ResponseEntity<List<Ownership>> getAllOwnerships() {
    return ResponseEntity.ok(ownershipService.getAllOwnerships());
}

@PutMapping("/{id}")
public ResponseEntity<Ownership> updateOwnership(
        @PathVariable Long id,
        @RequestBody Ownership ownership) {
    return ResponseEntity.ok(ownershipService.updateOwnership(id, ownership));
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteOwnership(@PathVariable Long id) {
    ownershipService.deleteOwnership(id);
    return ResponseEntity.noContent().build();
}

@GetMapping("/property/{propertyId}")
public ResponseEntity<List<Ownership>> getOwnershipsByPropertyId(
        @PathVariable Long propertyId) {
    return ResponseEntity.ok(ownershipService.getOwnershipsByPropertyId(propertyId));
}

}