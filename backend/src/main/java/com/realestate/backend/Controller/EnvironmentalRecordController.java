package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.EnvironmentalRecord;
import com.realestate.backend.Service.EnvironmentalRecordService;

@RestController
@RequestMapping("/api/environmental-records")
public class EnvironmentalRecordController {

    private final EnvironmentalRecordService environmentalRecordService;

    public EnvironmentalRecordController(
            EnvironmentalRecordService environmentalRecordService) {
        this.environmentalRecordService = environmentalRecordService;
    }

    @PostMapping
    public ResponseEntity<EnvironmentalRecord> createEnvironmentalRecord(
            @RequestBody EnvironmentalRecord environmentalRecord) {

        return ResponseEntity.ok(
                environmentalRecordService
                        .createEnvironmentalRecord(environmentalRecord));
    }

    @GetMapping
    public ResponseEntity<List<EnvironmentalRecord>>
            getAllEnvironmentalRecords() {

        return ResponseEntity.ok(
                environmentalRecordService
                        .getAllEnvironmentalRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnvironmentalRecord>
            getEnvironmentalRecordById(
                    @PathVariable Long id) {

        return ResponseEntity.ok(
                environmentalRecordService
                        .getEnvironmentalRecordById(id));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<EnvironmentalRecord>>
            getEnvironmentalRecordsByPropertyId(
                    @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                environmentalRecordService
                        .getEnvironmentalRecordsByPropertyId(propertyId));
    }
}