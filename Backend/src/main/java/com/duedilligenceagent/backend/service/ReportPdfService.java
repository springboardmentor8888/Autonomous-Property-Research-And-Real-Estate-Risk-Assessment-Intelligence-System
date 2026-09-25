package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.ReportResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Renders a generated due-diligence report as a professional PDF
 * (SRS: reports must be downloadable). Purely a view over the stored
 * {@link ReportResponse} — no data is fetched or calculated here.
 */
@Service
@Slf4j
public class ReportPdfService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("d MMMM yyyy, h:mm a");

    // Professional palette (matches the web UI).
    private static final Color NAVY = new Color(15, 23, 42);
    private static final Color SLATE = new Color(100, 116, 139);
    private static final Color SLATE_LIGHT = new Color(226, 232, 240);
    private static final Color TEXT = new Color(30, 41, 59);
    private static final Color EMERALD = new Color(16, 185, 129);
    private static final Color BLUE = new Color(59, 130, 246);
    private static final Color AMBER = new Color(245, 158, 11);
    private static final Color ROSE = new Color(225, 29, 72);

    private static final PDType1Font FONT_BOLD =
            new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private static final PDType1Font FONT =
            new PDType1Font(Standard14Fonts.FontName.HELVETICA);

    public byte[] generate(ReportResponse report) {
        try (PDDocument doc = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            float width = page.getMediaBox().getWidth();
            float margin = 50;

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float y = page.getMediaBox().getHeight() - margin;

                y = header(cs, report, width, y);
                y = propertySection(cs, report, margin, y);
                y = riskOverview(cs, report, margin, width, y);
                y = riskBars(cs, report, margin, width, y);
                y = executiveSummary(cs, report, margin, width, y);
                y = recordStatuses(cs, report, margin, width, y);
                y = dataCoverage(cs, report, margin, width, y);
                footer(cs, width, margin);
            }

            doc.save(out);
            log.info("Rendered PDF for report id={} ({} bytes)", report.getReportId(), out.size());
            return out.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to render report PDF: " + ex.getMessage(), ex);
        }
    }

    // --- sections ---

    private float header(PDPageContentStream cs, ReportResponse report, float width, float y)
            throws IOException {
        // Navy band across the top.
        rect(cs, 0, y - 92, width, 92, NAVY);
        text(cs, FONT_BOLD, 19, 50, y - 38, "DUE DILIGENCE REPORT", Color.WHITE);
        String meta = "Report #" + report.getReportId()
                + "   ·   Generated " + report.getGeneratedAt().format(DATE_FORMAT)
                + "   ·   Status: " + report.getStatus();
        text(cs, FONT, 9, 50, y - 58, meta, SLATE_LIGHT);
        return y - 92 - 28;
    }

    private float propertySection(PDPageContentStream cs, ReportResponse report,
                                  float margin, float y) throws IOException {
        label(cs, margin, y, "PROPERTY");
        y -= 16;
        String address = report.getPropertyAddress() != null
                ? report.getPropertyAddress() : "Property #" + report.getPropertyId();
        text(cs, FONT_BOLD, 12, margin, y, address, TEXT);
        return y - 30;
    }

    private float riskOverview(PDPageContentStream cs, ReportResponse report,
                               float margin, float width, float y) throws IOException {
        label(cs, margin, y, "RISK OVERVIEW");
        y -= 26;

        String tier = report.getRiskTier() == null ? "UNKNOWN" : report.getRiskTier();
        Color tierColor = tierColor(tier);
        String tierLabel = "INSUFFICIENT_DATA".equals(tier) ? "INSUFFICIENT DATA" : tier + " RISK";

        // Tier badge.
        float badgeWidth = FONT_BOLD.getStringWidth(tierLabel) / 1000 * 10 + 24;
        rect(cs, margin, y - 6, badgeWidth, 24, tierColor);
        text(cs, FONT_BOLD, 10, margin + 12, y + 3, tierLabel, Color.WHITE);

        // Overall score beside the badge.
        if (report.getRisk() != null && report.getRisk().getOverallScore() != null) {
            String score = "Overall Risk Score: "
                    + report.getRisk().getOverallScore().stripTrailingZeros().toPlainString()
                    + " / 100";
            text(cs, FONT_BOLD, 11, margin + badgeWidth + 16, y + 3, score, tierColor);
        } else {
            text(cs, FONT, 10, margin + badgeWidth + 16, y + 3,
                    "Risk scores could not be calculated — no diligence records available.", SLATE);
        }
        return y - 28;
    }

    private float riskBars(PDPageContentStream cs, ReportResponse report,
                           float margin, float width, float y) throws IOException {
        if (report.getRisk() == null) {
            return y;
        }
        label(cs, margin, y, "RISK ASSESSMENT (0–100, HIGHER = RISKIER)");
        y -= 14;

        var risk = report.getRisk();
        List<Domain> domains = List.of(
                new Domain("Overall", risk.getOverallScore()),
                new Domain("Property Tax", risk.getTaxRisk()),
                new Domain("Flood Zone", risk.getFloodRisk()),
                new Domain("Building Permits", risk.getPermitCompliance()),
                new Domain("Zoning", risk.getZoningCompliance()),
                new Domain("Legal / Environmental", risk.getLegalRisk()),
                new Domain("Ownership Verification", risk.getOwnershipVerification()));

        float barX = margin + 170;
        float barWidth = width - barX - margin - 40;
        for (Domain domain : domains) {
            text(cs, FONT, 9, margin, y, domain.name(), TEXT);
            if (domain.score() == null) {
                text(cs, FONT, 9, barX, y, "No records", SLATE);
            } else {
                double v = domain.score().doubleValue();
                // Track + colored fill.
                rect(cs, barX, y - 3, barWidth, 9, SLATE_LIGHT);
                rect(cs, barX, y - 3, (float) (barWidth * Math.min(100, v) / 100), 9, scoreColor(v));
                String scoreText = domain.score().stripTrailingZeros().toPlainString();
                text(cs, FONT_BOLD, 9, barX + barWidth + 10, y, scoreText, scoreColor(v));
            }
            y -= 20;
        }
        return y - 12;
    }

    private float executiveSummary(PDPageContentStream cs, ReportResponse report,
                                   float margin, float width, float y) throws IOException {
        label(cs, margin, y, "EXECUTIVE SUMMARY");
        y -= 16;
        String summary = report.getExecutiveSummary() == null ? "" : report.getExecutiveSummary();
        for (String line : wrap(summary, FONT, 10, width - margin * 2)) {
            text(cs, FONT, 10, margin, y, line, TEXT);
            y -= 14;
        }
        return y - 14;
    }

    private float recordStatuses(PDPageContentStream cs, ReportResponse report,
                                 float margin, float width, float y) throws IOException {
        if (report.getRecords() == null) {
            return y;
        }
        label(cs, margin, y, "RECORD STATUSES");
        y -= 16;
        var records = report.getRecords();
        List<String[]> rows = new ArrayList<>();
        if (records.getTaxStatus() != null) rows.add(new String[]{"Property Tax", records.getTaxStatus()});
        if (records.getPermitStatus() != null) rows.add(new String[]{"Building Permit", records.getPermitStatus()});
        if (records.getZoningStatus() != null) rows.add(new String[]{"Zoning", records.getZoningStatus()});
        if (records.getFloodRiskLevel() != null) rows.add(new String[]{"Flood Zone", records.getFloodRiskLevel()});
        if (records.getEnvironmentalStatus() != null) rows.add(new String[]{"Environmental", records.getEnvironmentalStatus()});
        if (records.getOwnershipType() != null) rows.add(new String[]{"Ownership", records.getOwnershipType()});
        if (records.getUtilitiesAvailable() != null) {
            rows.add(new String[]{"Utilities", records.getUtilitiesAvailable() + " available"});
        }
        if (rows.isEmpty()) {
            text(cs, FONT, 10, margin, y, "No diligence records on file for this property.", SLATE);
            return y - 24;
        }

        // Two columns of label/value pairs.
        float colWidth = (width - margin * 2) / 2;
        int half = (rows.size() + 1) / 2;
        float topY = y;
        for (int i = 0; i < rows.size(); i++) {
            float colX = margin + (i < half ? 0 : colWidth);
            float rowY = i < half ? topY - i * 16 : topY - (i - half) * 16;
            text(cs, FONT, 9, colX, rowY, rows.get(i)[0], SLATE);
            text(cs, FONT_BOLD, 9, colX + 130, rowY,
                    rows.get(i)[1].replaceAll("_", " "), TEXT);
        }
        return topY - half * 16 - 16;
    }

    private float dataCoverage(PDPageContentStream cs, ReportResponse report,
                                float margin, float width, float y) throws IOException {
        if (report.getCoverage() == null) {
            return y;
        }
        label(cs, margin, y, "DATA COVERAGE");
        y -= 16;
        var coverage = report.getCoverage();
        String line = (coverage.getComparablesCount() == null ? 0 : coverage.getComparablesCount())
                + " comparable listings · "
                + (coverage.getMarketTrendsCount() == null ? 0 : coverage.getMarketTrendsCount())
                + " market trend periods";
        text(cs, FONT, 10, margin, y, line, TEXT);
        y -= 14;
        if (coverage.getMissingSections() != null && !coverage.getMissingSections().isEmpty()) {
            String missing = "Not yet sourced: " + String.join(", ", coverage.getMissingSections());
            for (String wrapped : wrap(missing, FONT, 9, width - margin * 2)) {
                text(cs, FONT, 9, margin, y, wrapped, SLATE);
                y -= 12;
            }
        }
        return y - 10;
    }

    private void footer(PDPageContentStream cs, float width, float margin) throws IOException {
        float y = margin - 14;
        text(cs, FONT, 8, margin, y,
                "Generated by Due Diligence Agent — Autonomous Property Research & Risk Assessment", SLATE);
        String confidential = "CONFIDENTIAL";
        float w = FONT_BOLD.getStringWidth(confidential) / 1000 * 8;
        text(cs, FONT_BOLD, 8, width - margin - w, y, confidential, SLATE);
    }

    // --- helpers ---

    private record Domain(String name, java.math.BigDecimal score) {
    }

    private void label(PDPageContentStream cs, float x, float y, String text) throws IOException {
        text(cs, FONT_BOLD, 8, x, y, text, SLATE);
    }

    private void text(PDPageContentStream cs, PDType1Font font, float size,
                      float x, float y, String content, Color color) throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.setNonStrokingColor(color);
        cs.newLineAtOffset(x, y);
        cs.showText(content == null || content.isBlank() ? " " : content);
        cs.endText();
    }

    private void rect(PDPageContentStream cs, float x, float y, float w, float h, Color color)
            throws IOException {
        cs.setNonStrokingColor(color);
        cs.addRect(x, y, w, h);
        cs.fill();
    }

    private Color tierColor(String tier) {
        return switch (tier) {
            case "LOW" -> EMERALD;
            case "MODERATE" -> BLUE;
            case "ELEVATED" -> AMBER;
            case "HIGH" -> ROSE;
            default -> SLATE; // INSUFFICIENT_DATA / UNKNOWN
        };
    }

    private Color scoreColor(double v) {
        if (v >= 55) return ROSE;
        if (v >= 20) return AMBER;
        return EMERALD;
    }

    private List<String> wrap(String text, PDType1Font font, float size, float maxWidth)
            throws IOException {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return lines;
        }
        for (String paragraph : text.split("(?<=\\.)\\s+")) {
            String[] words = paragraph.split("\\s+");
            StringBuilder current = new StringBuilder();
            for (String word : words) {
                String candidate = current.isEmpty() ? word : current + " " + word;
                if (font.getStringWidth(candidate) / 1000 * size > maxWidth && !current.isEmpty()) {
                    lines.add(current.toString());
                    current = new StringBuilder(word);
                } else {
                    current = new StringBuilder(candidate);
                }
            }
            if (!current.isEmpty()) {
                lines.add(current.toString());
            }
        }
        return lines;
    }
}
