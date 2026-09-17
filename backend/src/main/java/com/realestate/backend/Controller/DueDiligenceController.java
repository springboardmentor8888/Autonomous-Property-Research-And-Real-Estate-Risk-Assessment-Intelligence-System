package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.DueDiligence;
import com.realestate.backend.Service.DueDiligenceService;

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