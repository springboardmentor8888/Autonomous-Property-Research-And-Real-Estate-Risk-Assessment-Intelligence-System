package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.BuildingPermitRecord;
import com.realestate.backend.Service.BuildingPermitRecordService;

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
@RequestMapping("/api/building-permits")
public class BuildingPermitRecordController {

    private final BuildingPermitRecordService buildingPermitRecordService;

    public BuildingPermitRecordController(
            BuildingPermitRecordService buildingPermitRecordService) {
        this.buildingPermitRecordService = buildingPermitRecordService;
    }

    @PostMapping
    public ResponseEntity<BuildingPermitRecord> createPermitRecord(
            @RequestBody BuildingPermitRecord permitRecord) {

        return ResponseEntity.ok(
                buildingPermitRecordService.createPermitRecord(permitRecord));
    }

    @GetMapping
    public ResponseEntity<List<BuildingPermitRecord>> getAllPermitRecords() {

        return ResponseEntity.ok(
                buildingPermitRecordService.getAllPermitRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BuildingPermitRecord> getPermitRecordById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                buildingPermitRecordService.getPermitRecordById(id));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<BuildingPermitRecord>> getPermitRecordsByPropertyId(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                buildingPermitRecordService
                        .getPermitRecordsByPropertyId(propertyId));
    }
}