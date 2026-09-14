package com.realestate.backend.controller;

import com.realestate.backend.entity.Permit;
import com.realestate.backend.service.PermitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permits")
public class PermitController {

    private final PermitService permitService;

    public PermitController(PermitService permitService) {
        this.permitService = permitService;
    }

    @PostMapping("/property/{propertyId}")
    public ResponseEntity<Permit> createPermit(
            @PathVariable Long propertyId,
            @RequestBody Permit permit) {

        Permit createdPermit =
                permitService.createPermit(propertyId, permit);

        return new ResponseEntity<>(createdPermit, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Permit>> getAllPermits() {
        return ResponseEntity.ok(permitService.getAllPermits());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Permit> getPermitById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                permitService.getPermitById(id));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Permit>> getPermitsByPropertyId(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                permitService.getPermitsByPropertyId(propertyId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Permit> updatePermit(
            @PathVariable Long id,
            @RequestBody Permit permit) {

        return ResponseEntity.ok(
                permitService.updatePermit(id, permit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePermit(
            @PathVariable Long id) {

        permitService.deletePermit(id);

        return ResponseEntity.ok(
                "Permit deleted successfully");
    }
}