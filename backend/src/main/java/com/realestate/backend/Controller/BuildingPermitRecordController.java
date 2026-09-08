package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.BuildingPermitRecord;
import com.realestate.backend.Service.BuildingPermitRecordService;

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