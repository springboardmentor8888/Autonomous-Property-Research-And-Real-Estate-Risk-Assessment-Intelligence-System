package com.realestate.backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.backend.Entity.DueDiligenceReport;
import com.realestate.backend.Service.DueDiligenceReportService;
import com.realestate.backend.Service.ExcelReportService;
import com.realestate.backend.Service.NotificationService;
import com.realestate.backend.Service.PdfReportService;

@RestController
@RequestMapping("/api/reports")
public class DueDiligenceReportController {

    @Autowired
    private DueDiligenceReportService dueDiligenceReportService;
    @Autowired
    private PdfReportService pdfReportService;
    @Autowired
    private ExcelReportService excelReportService;
    @Autowired
    private NotificationService notificationService;

    @GetMapping("/property/{propertyId}")
    public DueDiligenceReport generateReport(
            @PathVariable Long propertyId) {

        DueDiligenceReport report =
                dueDiligenceReportService.generateReport(propertyId);

        notificationService.createNotification(
                propertyId,
                "anju@example.com",
                "REPORT_READY",
                "Due diligence report is ready for property: "
                        + report.getPropertyAddress());

        return report;
    }
    @GetMapping("/property/{propertyId}/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable Long propertyId) {

        DueDiligenceReport report =
                dueDiligenceReportService.generateReport(propertyId);

        byte[] pdf =
                pdfReportService.generatePdf(report);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=due-diligence-report-"
                                + propertyId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
    @GetMapping("/property/{propertyId}/excel")
    public ResponseEntity<byte[]> downloadExcel(
            @PathVariable Long propertyId) throws Exception {

        DueDiligenceReport report =
                dueDiligenceReportService.generateReport(propertyId);

        byte[] excel =
                excelReportService.generateExcel(report);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=due-diligence-report-"
                                + propertyId + ".xlsx")
                .contentType(
                        MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }
}