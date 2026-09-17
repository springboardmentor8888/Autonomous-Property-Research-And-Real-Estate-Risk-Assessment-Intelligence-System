package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.OwnershipRecord;
import com.realestate.backend.Service.OwnershipRecordService;

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