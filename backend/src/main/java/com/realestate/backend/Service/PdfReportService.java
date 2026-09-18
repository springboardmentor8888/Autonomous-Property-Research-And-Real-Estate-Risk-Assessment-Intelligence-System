package com.realestate.backend.Service;

import java.io.ByteArrayOutputStream;

import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.realestate.backend.Entity.DueDiligenceReport;

@Service
public class PdfReportService {

    public byte[] generatePdf(DueDiligenceReport report) {

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Document document = new Document();

        PdfWriter.getInstance(document, outputStream);

        document.open();

        document.add(new Paragraph("REAL ESTATE DUE DILIGENCE REPORT"));

        document.add(new Paragraph(
                "Property ID: " + report.getPropertyId()));

        document.add(new Paragraph(
                "Property Address: " + report.getPropertyAddress()));

        document.add(new Paragraph(
                "Risk Score: " + report.getRiskScore()));

        document.add(new Paragraph(
                "Overall Risk: " + report.getOverallRisk()));

        document.add(new Paragraph(
                "Executive Summary: " + report.getExecutiveSummary()));

        document.add(new Paragraph(
                "Property Timeline: " + report.getPropertyTimeline()));

        document.add(new Paragraph(
                "Supporting Documents: "
                + report.getSupportingDocuments()));

        document.add(new Paragraph(
                "Generated At: " + report.getGeneratedAt()));

        document.close();

        return outputStream.toByteArray();
    }
}