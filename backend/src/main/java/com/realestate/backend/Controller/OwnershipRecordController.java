package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.OwnershipRecord;
import com.realestate.backend.Service.OwnershipRecordService;

@RestController
@RequestMapping("/api/ownership-records")
public class OwnershipRecordController {

    private final OwnershipRecordService ownershipRecordService;

    public OwnershipRecordController(
            OwnershipRecordService ownershipRecordService) {

        this.ownershipRecordService = ownershipRecordService;
    }

    @PostMapping
    public ResponseEntity<OwnershipRecord> createOwnershipRecord(
            @RequestBody OwnershipRecord ownershipRecord) {

        return ResponseEntity.ok(
                ownershipRecordService.createOwnershipRecord(ownershipRecord));
    }

    @GetMapping
    public ResponseEntity<List<OwnershipRecord>> getAllOwnershipRecords() {

        return ResponseEntity.ok(
                ownershipRecordService.getAllOwnershipRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OwnershipRecord> getOwnershipRecordById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ownershipRecordService.getOwnershipRecordById(id));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<OwnershipRecord>> getOwnershipRecordsByPropertyId(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                ownershipRecordService
                        .getOwnershipRecordsByPropertyId(propertyId));
    }
}