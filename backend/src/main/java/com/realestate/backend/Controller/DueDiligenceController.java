package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.DueDiligence;
import com.realestate.backend.Service.DueDiligenceService;

@RestController
@RequestMapping("/api/due-diligence")
public class DueDiligenceController {

    private final DueDiligenceService dueDiligenceService;

    public DueDiligenceController(DueDiligenceService dueDiligenceService) {
        this.dueDiligenceService = dueDiligenceService;
    }

    @PostMapping
    public ResponseEntity<DueDiligence> createDueDiligence(
            @RequestBody DueDiligence dueDiligence) {

        return ResponseEntity.ok(
                dueDiligenceService.createDueDiligence(dueDiligence)
        );
    }

    @GetMapping
    public ResponseEntity<List<DueDiligence>> getAllDueDiligence() {

        return ResponseEntity.ok(
                dueDiligenceService.getAllDueDiligence()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<DueDiligence> getDueDiligenceById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                dueDiligenceService.getDueDiligenceById(id)
        );
    }
}