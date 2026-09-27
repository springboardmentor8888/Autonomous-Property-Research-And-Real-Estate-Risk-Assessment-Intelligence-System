package com.realestate.backend.controller;

import com.realestate.backend.dto.*;
import com.realestate.backend.service.FloodValidationService;
import com.realestate.backend.service.PermitValidationService;
import com.realestate.backend.service.TaxValidationService;
import com.realestate.backend.service.ZoningValidationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/validation")
@CrossOrigin(origins = "*")
public class RiskValidationController {

    private final PermitValidationService permitValidationService;
    private final TaxValidationService taxValidationService;
    private final FloodValidationService floodValidationService;
    private final ZoningValidationService zoningValidationService;

    @Autowired
    public RiskValidationController(
            PermitValidationService permitValidationService,
            TaxValidationService taxValidationService,
            FloodValidationService floodValidationService,
            ZoningValidationService zoningValidationService) {
        this.permitValidationService = permitValidationService;
        this.taxValidationService = taxValidationService;
        this.floodValidationService = floodValidationService;
        this.zoningValidationService = zoningValidationService;
    }

    /**
     * Evaluates open/expired building permits and structural risk tiers.
     */
    @PostMapping("/permits")
    public ResponseEntity<ApiResponse<PermitValidationResponseDTO>> validatePermits(
            @RequestBody List<PermitRecordDTO> permits) {
        PermitValidationResponseDTO result = permitValidationService.validatePermits(permits);
        return ResponseEntity.ok(ApiResponse.success("Permit validation completed", result));
    }

    /**
     * Analyzes property tax records, delinquency, and potential tax liens.
     */
    @PostMapping("/taxes")
    public ResponseEntity<ApiResponse<TaxValidationResponseDTO>> validateTaxes(
            @RequestBody List<TaxHistoryDTO> taxHistory) {
        TaxValidationResponseDTO result = taxValidationService.validateTaxHistory(taxHistory);
        return ResponseEntity.ok(ApiResponse.success("Tax validation completed", result));
    }

    /**
     * Evaluates FEMA flood zone designations and mandatory insurance requirements.
     */
    @PostMapping("/flood")
    public ResponseEntity<ApiResponse<FloodValidationResponseDTO>> validateFloodZone(
            @Valid @RequestBody FloodZoneDTO floodZone) {
        FloodValidationResponseDTO result = floodValidationService.validateFloodZone(floodZone);
        return ResponseEntity.ok(ApiResponse.success("Flood zone validation completed", result));
    }

    /**
     * Assesses land use compatibility against municipal zoning regulations.
     */
    @PostMapping("/zoning")
    public ResponseEntity<ApiResponse<ZoningValidationResponseDTO>> validateZoning(
            @Valid @RequestBody ZoningValidationRequestDTO request) {
        ZoningValidationResponseDTO result = zoningValidationService.validateZoning(
                request.getZoningInfo(),
                request.getPropertyType()
        );
        return ResponseEntity.ok(ApiResponse.success("Zoning validation completed", result));
    }
}
