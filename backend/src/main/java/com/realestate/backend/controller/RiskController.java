package com.realestate.backend.controller;

import com.realestate.backend.dto.RiskAssessmentResponseDTO;
import com.realestate.backend.service.RiskEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/risk")
public class RiskController {

    private final RiskEngineService riskEngineService;

    public RiskController(RiskEngineService riskEngineService) {
        this.riskEngineService = riskEngineService;
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<RiskAssessmentResponseDTO> assessRisk(
            @PathVariable Long propertyId) {

        RiskAssessmentResponseDTO response =
                riskEngineService.assessRisk(propertyId);

        return ResponseEntity.ok(response);
    }
}