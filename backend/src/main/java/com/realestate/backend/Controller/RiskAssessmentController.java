package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.RiskAssessment;
import com.realestate.backend.Service.RiskAssessmentService;

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
@RequestMapping("/api/risk-assessments")
public class RiskAssessmentController {

    private final RiskAssessmentService riskAssessmentService;

    public RiskAssessmentController(
            RiskAssessmentService riskAssessmentService) {

        this.riskAssessmentService = riskAssessmentService;
    }

    @PostMapping
    public ResponseEntity<RiskAssessment> createRiskAssessment(
            @RequestBody RiskAssessment riskAssessment) {

        return ResponseEntity.ok(
                riskAssessmentService.createRiskAssessment(riskAssessment));
    }

    @GetMapping
    public ResponseEntity<List<RiskAssessment>> getAllRiskAssessments() {

        return ResponseEntity.ok(
                riskAssessmentService.getAllRiskAssessments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RiskAssessment> getRiskAssessmentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                riskAssessmentService.getRiskAssessmentById(id));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<RiskAssessment> getRiskAssessmentByPropertyId(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                riskAssessmentService
                        .getRiskAssessmentByPropertyId(propertyId));
    }
}