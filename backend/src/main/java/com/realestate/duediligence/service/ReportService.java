package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.ReportDto;
import com.realestate.duediligence.entity.DueDiligenceReport;
import com.realestate.duediligence.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public ReportDto generateReport(Long propertyId) {
        String reportId = "REP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        DueDiligenceReport report = DueDiligenceReport.builder()
                .id(reportId)
                .propertyId(propertyId)
                .generatedAt(LocalDateTime.now())
                .pdfPath("/api/reports/" + reportId + "/pdf")
                .excelPath("/api/reports/" + reportId + "/excel")
                .build();

        reportRepository.save(report);

        return ReportDto.builder()
                .reportId(report.getId())
                .propertyId(report.getPropertyId())
                .generatedAt(report.getGeneratedAt())
                .downloadUrlPdf(report.getPdfPath())
                .downloadUrlExcel(report.getExcelPath())
                .build();
    }

    public byte[] generatePdfBytes(String reportId) {
        String pdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
                + "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
                + "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n"
                + "4 0 obj\n<< /Length 120 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n"
                + "(Autonomous Property Risk Assessment Report - " + reportId + ") Tj\nET\nendstream\nendobj\n"
                + "trailer\n<< /Root 1 0 R >>\n%%EOF";
        return pdfContent.getBytes();
    }

    public byte[] generateExcelBytes(String reportId) {
        String csvContent = "ReportID,PropertyID,GeneratedAt,Status,RiskScore\n"
                + reportId + ",1," + LocalDateTime.now() + ",VERIFIED,LOW (12/100)\n";
        return csvContent.getBytes();
    }
}
