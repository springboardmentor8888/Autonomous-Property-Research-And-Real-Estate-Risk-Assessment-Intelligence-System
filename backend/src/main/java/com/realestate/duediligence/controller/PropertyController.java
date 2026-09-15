package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.*;
import com.realestate.duediligence.entity.*;
import com.realestate.duediligence.service.PropertyService;
import com.realestate.duediligence.service.ReportService;
import com.realestate.duediligence.service.RiskAssessmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;
    private final RiskAssessmentService riskAssessmentService;
    private final ReportService reportService;

    public PropertyController(PropertyService propertyService,
                              RiskAssessmentService riskAssessmentService,
                              ReportService reportService) {
        this.propertyService = propertyService;
        this.riskAssessmentService = riskAssessmentService;
        this.reportService = reportService;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PropertyDto>>> searchProperties(@RequestParam(value = "address", required = false) String address) {
        List<PropertyDto> properties = propertyService.searchProperties(address);
        return ResponseEntity.ok(ApiResponse.ok(properties));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<AddressValidation>> validateAddress(@RequestBody AddressValidationRequest request) {
        AddressValidation validation = propertyService.validateAddress(request.getAddress());
        return ResponseEntity.ok(ApiResponse.ok(validation, "Address validation completed"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyDto>> getPropertyById(@PathVariable("id") Long id) {
        PropertyDto property = propertyService.getPropertyById(id);
        return ResponseEntity.ok(ApiResponse.ok(property));
    }

    @GetMapping("/{id}/tax-history")
    public ResponseEntity<ApiResponse<List<TaxRecord>>> getTaxHistory(@PathVariable("id") Long id) {
        List<TaxRecord> taxes = propertyService.getTaxHistory(id);
        return ResponseEntity.ok(ApiResponse.ok(taxes));
    }

    @GetMapping("/{id}/zoning")
    public ResponseEntity<ApiResponse<PropertyDto.ZoningInfo>> getZoningInfo(@PathVariable("id") Long id) {
        PropertyDto prop = propertyService.getPropertyById(id);
        return ResponseEntity.ok(ApiResponse.ok(prop.getZoning()));
    }

    @GetMapping("/{id}/flood-zone")
    public ResponseEntity<ApiResponse<PropertyDto.FloodZoneInfo>> getFloodZoneInfo(@PathVariable("id") Long id) {
        PropertyDto prop = propertyService.getPropertyById(id);
        return ResponseEntity.ok(ApiResponse.ok(prop.getFloodZone()));
    }

    @GetMapping("/{id}/permits")
    public ResponseEntity<ApiResponse<List<PermitRecord>>> getPermitRecords(@PathVariable("id") Long id) {
        List<PermitRecord> permits = propertyService.getPermits(id);
        return ResponseEntity.ok(ApiResponse.ok(permits));
    }

    @GetMapping("/{id}/risk-assessment")
    public ResponseEntity<ApiResponse<RiskAssessmentDto>> getRiskAssessment(@PathVariable("id") Long id) {
        RiskAssessmentDto risk = riskAssessmentService.getRiskAssessment(id);
        return ResponseEntity.ok(ApiResponse.ok(risk));
    }

    @GetMapping("/{id}/comparables")
    public ResponseEntity<ApiResponse<List<ComparableProperty>>> getComparables(@PathVariable("id") Long id) {
        List<ComparableProperty> comparables = propertyService.getComparables(id);
        return ResponseEntity.ok(ApiResponse.ok(comparables));
    }

    @PostMapping("/{id}/reports")
    public ResponseEntity<ApiResponse<ReportDto>> generateReport(@PathVariable("id") Long id) {
        ReportDto report = reportService.generateReport(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(report, "Due diligence report generated successfully"));
    }
}
