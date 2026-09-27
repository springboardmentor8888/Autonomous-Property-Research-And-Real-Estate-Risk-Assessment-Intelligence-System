package com.realestate.backend.controller;

import com.realestate.backend.dto.ApiResponse;
import com.realestate.backend.dto.ReportResponseDTO;
import com.realestate.backend.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

private final ReportService reportService;

public ReportController(ReportService reportService) {
    this.reportService = reportService;
}

@GetMapping("/{propertyId}")
public ResponseEntity<ApiResponse<ReportResponseDTO>> generateReport(
        @PathVariable Long propertyId) {

    ReportResponseDTO report =
            reportService.generateReport(propertyId);

    return ResponseEntity.ok(
            ApiResponse.success(
                    "Property report generated successfully",
                    report
            )
    );
}

}