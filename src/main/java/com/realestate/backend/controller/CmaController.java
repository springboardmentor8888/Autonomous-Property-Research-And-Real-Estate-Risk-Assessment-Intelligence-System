package com.realestate.backend.controller;

import com.realestate.backend.dto.ApiResponse;
import com.realestate.backend.dto.CmaAnalysisResponseDTO;
import com.realestate.backend.service.CmaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cma")
@CrossOrigin(origins = "*")
public class CmaController {

    private final CmaService cmaService;

    @Autowired
    public CmaController(CmaService cmaService) {
        this.cmaService = cmaService;
    }

    /**
     * Executes Comparable Property Analysis (CMA) for a property.
     * Evaluates comparable market pricing, ₹/sq.ft metrics, and valuation variances.
     *
     * @param propertyId ID of the property to evaluate
     * @return Complete CMA analytics report
     */
    @GetMapping("/analyze/{propertyId}")
    public ResponseEntity<ApiResponse<CmaAnalysisResponseDTO>> analyzeProperty(@PathVariable Long propertyId) {
        CmaAnalysisResponseDTO analysis = cmaService.analyzeProperty(propertyId);
        return ResponseEntity.ok(ApiResponse.success("CMA Analysis completed successfully", analysis));
    }
}
