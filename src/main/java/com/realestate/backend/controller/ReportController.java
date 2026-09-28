package com.realestate.backend.controller;

import com.realestate.backend.dto.ApiResponse;
import com.realestate.backend.dto.CmaAnalysisResponseDTO;
import com.realestate.backend.service.CmaService;
import com.realestate.backend.service.ExcelReportService;
import com.realestate.backend.service.PdfReportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final CmaService cmaService;
    private final PdfReportService pdfReportService;
    private final ExcelReportService excelReportService;

    public ReportController(CmaService cmaService,
                            PdfReportService pdfReportService,
                            ExcelReportService excelReportService) {
        this.cmaService = cmaService;
        this.pdfReportService = pdfReportService;
        this.excelReportService = excelReportService;
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<ApiResponse<CmaAnalysisResponseDTO>> getReportSummary(@PathVariable Long propertyId) {
        CmaAnalysisResponseDTO analysis = cmaService.analyzeProperty(propertyId);
        return ResponseEntity.ok(ApiResponse.success("Due Diligence Report fetched successfully", analysis));
    }

    @GetMapping("/{propertyId}/pdf")
    public ResponseEntity<InputStreamResource> downloadPdfReport(@PathVariable Long propertyId) {
        ByteArrayInputStream pdfStream = pdfReportService.generatePropertyPdf(propertyId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=Due_Diligence_Report_" + propertyId + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdfStream));
    }

    @GetMapping("/{propertyId}/excel")
    public ResponseEntity<InputStreamResource> downloadExcelReport(@PathVariable Long propertyId) {
        ByteArrayInputStream excelStream = excelReportService.generatePropertyExcel(propertyId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=Due_Diligence_Report_" + propertyId + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(excelStream));
    }
}
