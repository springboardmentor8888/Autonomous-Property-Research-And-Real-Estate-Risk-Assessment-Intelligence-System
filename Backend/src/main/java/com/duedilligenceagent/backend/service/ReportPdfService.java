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
 * Renders a generated due-diligence report as a professional multi-page
 * PDF (SRS: reports must be downloadable). The client-facing report:
 * communicates the overall result, identified risks, supporting findings
 * and the final assessment — not a dump of every record. Purely a view
 * over the stored {@link ReportResponse} — no data is fetched here.
 */
@Service
@Slf4j
public class ReportPdfService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("d MMMM yyyy, h:mm a");
    private static final DateTimeFormatter DATE_ONLY =
            DateTimeFormatter.ofPattern("d MMM yyyy");

    private static final float MARGIN = 50;
    private static final float PAGE_BREAK_THRESHOLD = 70;

    // Professional palette (matches the web UI's muted enterprise tones).
    private static final Color NAVY = new Color(15, 23, 42);
    private static final Color SLATE = new Color(100, 116, 139);
    private static final Color SLATE_LIGHT = new Color(226, 232, 240);
    private static final Color TEXT = new Color(30, 41, 59);
    private static final Color TEAL = new Color(15, 118, 110);
    private static final Color GOLD = new Color(180, 83, 9);
    private static final Color ORANGE = new Color(194, 65, 12);
    private static final Color ROSE = new Color(190, 18, 60);

    private static final PDType1Font FONT_BOLD =
            new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private static final PDType1Font FONT =
            new PDType1Font(Standard14Fonts.FontName.HELVETICA);

    public byte[] generate(ReportResponse report) {
        try (PDDocument doc = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDPage firstPage = new PDPage(PDRectangle.A4);
            doc.addPage(firstPage);
            float width = firstPage.getMediaBox().getWidth();

            RenderContext ctx = new RenderContext(doc, report);

            try (PDPageContentStream cs = new PDPageContentStream(doc, firstPage)) {
                ctx.cs = cs;
                ctx.y = firstPage.getMediaBox().getHeight() - MARGIN;

                ctx.y = header(cs, report, width, ctx.y);
                ctx.y = propertyOverview(cs, report, width, ctx.y);
                ctx.y = riskOverview(cs, report, width, ctx.y);
                ctx.y = riskBars(ctx, report, width, ctx.y);
                ctx.y = executiveSummary(ctx, report, width, ctx.y);
                ctx.y = findingsSection(ctx, report, width, ctx.y);
                ctx.y = timelineSection(ctx, report, width, ctx.y);
                ctx.y = marketSection(ctx, report, width, ctx.y);
                ctx.y = dataCoverage(ctx, report, width, ctx.y);
                ctx.y = documentsSection(ctx, report, width, ctx.y);
                ctx.y = finalAssessment(ctx, report, width, ctx.y);
            }

            // Close the current context stream (newPage() may have replaced
            // the original one that try-with-resources would close).
            ctx.closeQuietly();

            // Footers on every page (page numbers included).
            for (int i = 0; i < doc.getNumberOfPages(); i++) {
                PDPage page = doc.getPage(i);
                try (PDPageContentStream cs = new PDPageContentStream(doc, page,
                        PDPageContentStream.AppendMode.APPEND, true, true)) {
                    footer(cs, page.getMediaBox().getWidth(), MARGIN, i + 1, doc.getNumberOfPages());
                }
            }

            doc.save(out);
            log.info("Rendered PDF for report id={} ({} pages, {} bytes)",
                    report.getReportId(), doc.getNumberOfPages(), out.size());
            return out.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to render report PDF: " + ex.getMessage(), ex);
        }
    }

    /** Render cursor: current content stream, y position and page count. */
    private static final class RenderContext {
        final PDDocument doc;
        final ReportResponse report;
        PDPageContentStream cs;
        float y;
        int pageNumber = 1;

        RenderContext(PDDocument doc, ReportResponse report) {
            this.doc = doc;
            this.report = report;
        }

        void newPage() throws IOException {
            cs.close();
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            try (PDPageContentStream slim = new PDPageContentStream(doc, page)) {
                slimHeader(slim, page.getMediaBox().getWidth(),
                        page.getMediaBox().getHeight() - MARGIN, report);
            }
            cs = new PDPageContentStream(doc, page);
            y = page.getMediaBox().getHeight() - MARGIN - 34;
            pageNumber++;
        }

        boolean needsBreak(float required) {
            return y - required < PAGE_BREAK_THRESHOLD;
        }

        void closeQuietly() {
            try {
                if (cs != null) {
                    cs.close();
                }
            } catch (IOException ignored) {
                // already closed
            }
            cs = null;
        }
    }

    /** Slim continuation header for pages after the first. */
    private static void slimHeader(PDPageContentStream cs, float width, float y,
                            ReportResponse report) throws IOException {
        rect(cs, 0, y - 24, width, 24, NAVY);
        text(cs, FONT_BOLD, 9, MARGIN, y - 16, "DUE DILIGENCE REPORT", Color.WHITE);
        String meta = "Report #" + report.getReportId();
        float w = FONT.getStringWidth(meta) / 1000 * 9;
        text(cs, FONT, 9, width - MARGIN - w, y - 16, meta, SLATE_LIGHT);
    }

    // --- sections ---

    private float header(PDPageContentStream cs, ReportResponse report, float width, float y)
            throws IOException {
        rect(cs, 0, y - 92, width, 92, NAVY);
        text(cs, FONT_BOLD, 19, MARGIN, y - 38, "DUE DILIGENCE REPORT", Color.WHITE);
        String meta = "Report #" + report.getReportId()
                + "   ·   Generated " + report.getGeneratedAt().format(DATE_FORMAT)
                + "   ·   Status: " + report.getStatus();
        text(cs, FONT, 9, MARGIN, y - 58, meta, SLATE_LIGHT);
        return y - 92 - 28;
    }

    private float propertyOverview(PDPageContentStream cs, ReportResponse report,
                                   float width, float y) throws IOException {
        label(cs, MARGIN, y, "PROPERTY OVERVIEW");
        y -= 16;
        String address = report.getPropertyAddress() != null
                ? report.getPropertyAddress() : "Property #" + report.getPropertyId();
        text(cs, FONT_BOLD, 12, MARGIN, y, address, TEXT);
        y -= 16;

        StringBuilder line = new StringBuilder();
        ReportResponse.PropertyInfo info = report.getPropertyInfo();
        if (info != null) {
            if (info.getPropertyType() != null) line.append(info.getPropertyType());
            if (info.getLocality() != null) {
                line.append(line.isEmpty() ? "" : "  ·  ").append(info.getLocality());
            }
            if (info.getCity() != null) {
                line.append(line.isEmpty() ? "" : "  ·  ").append(info.getCity());
            }
            if (info.getPrice() != null) {
                line.append(line.isEmpty() ? "" : "  ·  ")
                        .append("₹").append(info.getPrice().toPlainString());
            }
            if (info.getReraId() != null && !info.getReraId().isBlank()) {
                line.append(line.isEmpty() ? "" : "  ·  ").append("RERA ").append(info.getReraId());
            }
        }
        if (!line.isEmpty()) {
            for (String wrapped : wrap(line.toString(), FONT, 9, width - MARGIN * 2)) {
                text(cs, FONT, 9, MARGIN, y, wrapped, SLATE);
                y -= 12;
            }
        }
        return y - 16;
    }

    private float riskOverview(PDPageContentStream cs, ReportResponse report,
                               float width, float y) throws IOException {
        label(cs, MARGIN, y, "RISK OVERVIEW");
        y -= 26;

        String tier = report.getRiskTier() == null ? "UNKNOWN" : report.getRiskTier();
        Color tierColor = tierColor(tier);
        String tierLabel = "INSUFFICIENT_DATA".equals(tier) ? "INSUFFICIENT DATA" : tier + " RISK";

        float badgeWidth = FONT_BOLD.getStringWidth(tierLabel) / 1000 * 10 + 24;
        rect(cs, MARGIN, y - 6, badgeWidth, 24, tierColor);
        text(cs, FONT_BOLD, 10, MARGIN + 12, y + 3, tierLabel, Color.WHITE);

        if (report.getRisk() != null && report.getRisk().getOverallScore() != null) {
            String score = "Overall Risk Score: "
                    + report.getRisk().getOverallScore().stripTrailingZeros().toPlainString()
                    + " / 100";
            text(cs, FONT_BOLD, 11, MARGIN + badgeWidth + 16, y + 3, score, tierColor);
        } else {
            text(cs, FONT, 10, MARGIN + badgeWidth + 16, y + 3,
                    "Risk scores could not be calculated — no diligence records available.", SLATE);
        }
        y -= 28;

        // Short overall assessment + key risk findings (from the verdict).
        if (report.getVerdict() != null) {
            for (String line : wrap(report.getVerdict().getHeadline(), FONT_BOLD, 10, width - MARGIN * 2)) {
                text(cs, FONT_BOLD, 10, MARGIN, y, line, TEXT);
                y -= 14;
            }
            List<String> keyFindings = report.getVerdict().getMajorConcerns();
            if (keyFindings != null && !keyFindings.isEmpty()) {
                y -= 2;
                for (String concern : keyFindings) {
                    for (String line : wrap("• " + concern, FONT, 9, width - MARGIN * 2 - 8)) {
                        text(cs, FONT, 9, MARGIN + 8, y, line, SLATE);
                        y -= 12;
                    }
                }
            }
        }
        return y - 14;
    }

    private float riskBars(RenderContext ctx, ReportResponse report, float width, float y)
            throws IOException {
        if (report.getRisk() == null) {
            return y;
        }
        label(ctx.cs, MARGIN, y, "RISK ASSESSMENT (0–100, HIGHER = RISKIER)");
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

        float barX = MARGIN + 170;
        float barWidth = width - barX - MARGIN - 40;
        for (Domain domain : domains) {
            if (ctx.needsBreak(20)) {
                ctx.newPage();
                y = ctx.y;
            }
            text(ctx.cs, FONT, 9, MARGIN, y, domain.name(), TEXT);
            if (domain.score() == null) {
                text(ctx.cs, FONT, 9, barX, y, "No records", SLATE);
            } else {
                double v = domain.score().doubleValue();
                rect(ctx.cs, barX, y - 3, barWidth, 9, SLATE_LIGHT);
                rect(ctx.cs, barX, y - 3, (float) (barWidth * Math.min(100, v) / 100), 9, scoreColor(v));
                String scoreText = domain.score().stripTrailingZeros().toPlainString();
                text(ctx.cs, FONT_BOLD, 9, barX + barWidth + 10, y, scoreText, scoreColor(v));
            }
            y -= 20;
        }
        return y - 12;
    }

    private float executiveSummary(RenderContext ctx, ReportResponse report,
                                   float width, float y) throws IOException {
        label(ctx.cs, MARGIN, y, "EXECUTIVE SUMMARY");
        y -= 16;

        // Point-wise bullets when available; paragraph fallback otherwise.
        if (report.getSummaryPoints() != null && !report.getSummaryPoints().isEmpty()) {
            for (String point : report.getSummaryPoints()) {
                if (ctx.needsBreak(14)) {
                    ctx.newPage();
                    y = ctx.y;
                }
                for (String line : wrap("• " + point, FONT, 10, width - MARGIN * 2 - 8)) {
                    text(ctx.cs, FONT, 10, MARGIN + 8, y, line, TEXT);
                    y -= 14;
                }
            }
            return y - 14;
        }

        String summary = report.getExecutiveSummary() == null ? "" : report.getExecutiveSummary();
        for (String line : wrap(summary, FONT, 10, width - MARGIN * 2)) {
            if (ctx.needsBreak(14)) {
                ctx.newPage();
                y = ctx.y;
            }
            text(ctx.cs, FONT, 10, MARGIN, y, line, TEXT);
            y -= 14;
        }
        return y - 14;
    }

    private float findingsSection(RenderContext ctx, ReportResponse report,
                                  float width, float y) throws IOException {
        if (report.getFindings() == null || report.getFindings().isEmpty()) {
            return y;
        }
        label(ctx.cs, MARGIN, y, "DUE DILIGENCE FINDINGS");
        y -= 16;

        for (ReportResponse.Finding finding : report.getFindings()) {
            if (ctx.needsBreak(18)) {
                ctx.newPage();
                y = ctx.y;
            }
            String status = finding.getStatus() == null ? "—"
                    : finding.getStatus().replaceAll("_", " ");
            text(ctx.cs, FONT_BOLD, 9, MARGIN, y, finding.getArea(), TEXT);
            float statusX = MARGIN + 150;
            text(ctx.cs, FONT_BOLD, 9, statusX, y, status, TEXT);
            y -= 11;
            if (finding.getDetail() != null && !finding.getDetail().isBlank()) {
                for (String line : wrap(finding.getDetail(), FONT, 8, width - MARGIN - 150 - 10)) {
                    text(ctx.cs, FONT, 8, MARGIN + 150, y, line, SLATE);
                    y -= 11;
                }
            }
            y -= 5;
        }
        return y - 12;
    }

    private float timelineSection(RenderContext ctx, ReportResponse report,
                                  float width, float y) throws IOException {
        if (report.getTimeline() == null || report.getTimeline().isEmpty()) {
            return y;
        }
        label(ctx.cs, MARGIN, y, "PROPERTY TIMELINE");
        y -= 16;

        for (ReportResponse.TimelineEvent event : report.getTimeline()) {
            if (ctx.needsBreak(18)) {
                ctx.newPage();
                y = ctx.y;
            }
            String date = event.getDate() != null ? event.getDate().format(DATE_ONLY) : "—";
            String type = event.getEventType() == null ? "—"
                    : event.getEventType().replaceAll("_", " ");
            text(ctx.cs, FONT_BOLD, 9, MARGIN, y, date, TEXT);
            text(ctx.cs, FONT, 8, MARGIN + 70, y, type, SLATE);
            y -= 11;
            String description = event.getDescription() == null ? "" : event.getDescription()
                    + (event.getSource() != null && !event.getSource().isBlank()
                        ? "  —  Source: " + event.getSource() : "");
            for (String line : wrap(description, FONT, 9, width - MARGIN * 2 - 10)) {
                text(ctx.cs, FONT, 9, MARGIN + 14, y, line, TEXT);
                y -= 12;
            }
            y -= 4;
        }
        return y - 12;
    }

    private float marketSection(RenderContext ctx, ReportResponse report,
                                float width, float y) throws IOException {
        boolean hasPositioning = report.getMarketPosition() != null
                && report.getMarketPosition().getVerdict() != null;
        boolean hasComparables = report.getCoverage() != null
                && report.getCoverage().getComparablesCount() != null
                && report.getCoverage().getComparablesCount() > 0;
        if (!hasPositioning && !hasComparables) {
            return y;
        }

        label(ctx.cs, MARGIN, y, "COMPARABLE & MARKET ANALYSIS");
        y -= 16;

        if (hasPositioning) {
            var pos = report.getMarketPosition();
            String verdict = pos.getVerdict().replaceAll("_", " ").toLowerCase();
            String delta = pos.getDeltaPercent() == null ? ""
                    : " (" + (pos.getDeltaPercent().signum() > 0 ? "+" : "")
                    + pos.getDeltaPercent().stripTrailingZeros().toPlainString() + "% vs comparables)";
            for (String line : wrap("Market positioning: " + verdict + delta,
                    FONT_BOLD, 10, width - MARGIN * 2)) {
                text(ctx.cs, FONT_BOLD, 10, MARGIN, y, line, TEXT);
                y -= 14;
            }
            y -= 4;
        }

        if (hasComparables) {
            String line = report.getCoverage().getComparablesCount() + " comparable listings on record"
                    + (report.getCoverage().getMarketTrendsCount() != null
                        ? "  ·  " + report.getCoverage().getMarketTrendsCount() + " market trend periods"
                        : "");
            text(ctx.cs, FONT, 9, MARGIN, y, line, SLATE);
            y -= 16;
        }
        return y - 12;
    }

    private float dataCoverage(RenderContext ctx, ReportResponse report,
                               float width, float y) throws IOException {
        if (report.getCoverage() == null) {
            return y;
        }
        label(ctx.cs, MARGIN, y, "DATA COVERAGE");
        y -= 16;
        var coverage = report.getCoverage();
        String line = (coverage.getComparablesCount() == null ? 0 : coverage.getComparablesCount())
                + " comparable listings  ·  "
                + (coverage.getMarketTrendsCount() == null ? 0 : coverage.getMarketTrendsCount())
                + " market trend periods";
        text(ctx.cs, FONT, 10, MARGIN, y, line, TEXT);
        y -= 14;
        if (coverage.getMissingSections() != null && !coverage.getMissingSections().isEmpty()) {
            String missing = "Not yet sourced: " + String.join(", ", coverage.getMissingSections());
            for (String wrapped : wrap(missing, FONT, 9, width - MARGIN * 2)) {
                text(ctx.cs, FONT, 9, MARGIN, y, wrapped, SLATE);
                y -= 12;
            }
        }
        return y - 10;
    }

    private float documentsSection(RenderContext ctx, ReportResponse report,
                                   float width, float y) throws IOException {
        if (report.getDocuments() == null || report.getDocuments().isEmpty()) {
            return y;
        }
        label(ctx.cs, MARGIN, y, "SUPPORTING DOCUMENTS / EVIDENCE");
        y -= 16;

        for (ReportResponse.DocumentInfo doc : report.getDocuments()) {
            if (ctx.needsBreak(14)) {
                ctx.newPage();
                y = ctx.y;
            }
            String line = doc.getFileName()
                    + (doc.getFileType() != null ? "  (" + doc.getFileType() + ")" : "")
                    + (doc.getUploadedAt() != null
                        ? "  —  uploaded " + doc.getUploadedAt().format(DATE_FORMAT) : "");
            for (String wrapped : wrap(line, FONT, 9, width - MARGIN * 2)) {
                text(ctx.cs, FONT, 9, MARGIN, y, wrapped, TEXT);
                y -= 12;
            }
        }
        return y - 12;
    }

    private float finalAssessment(RenderContext ctx, ReportResponse report,
                                  float width, float y) throws IOException {
        if (report.getVerdict() == null) {
            return y;
        }

        if (ctx.needsBreak(130)) {
            ctx.newPage();
            y = ctx.y;
        }

        String tier = report.getRiskTier() == null ? "UNKNOWN" : report.getRiskTier();
        Color tierColor = tierColor(tier);

        float boxTop = y;
        int concernLines = report.getVerdict().getMajorConcerns() == null ? 0
                : report.getVerdict().getMajorConcerns().size();
        int actionLines = report.getVerdict().getFollowUpActions() == null ? 0
                : report.getVerdict().getFollowUpActions().size();
        float boxHeight = 52 + concernLines * 13 + actionLines * 26 + 16;
        rect(ctx.cs, MARGIN, boxTop - boxHeight, width - MARGIN * 2, boxHeight, SLATE_LIGHT);
        rect(ctx.cs, MARGIN, boxTop - boxHeight, 4, boxHeight, tierColor);

        float innerY = boxTop - 18;
        text(ctx.cs, FONT_BOLD, 8, MARGIN + 16, innerY, "FINAL DUE DILIGENCE ASSESSMENT", SLATE);
        innerY -= 17;
        for (String line : wrap(report.getVerdict().getHeadline(), FONT_BOLD, 11, width - MARGIN * 2 - 32)) {
            text(ctx.cs, FONT_BOLD, 11, MARGIN + 16, innerY, line, tierColor);
            innerY -= 15;
        }
        innerY -= 5;

        if (report.getVerdict().getMajorConcerns() != null) {
            for (String concern : report.getVerdict().getMajorConcerns()) {
                for (String line : wrap("• " + concern, FONT, 9, width - MARGIN * 2 - 44)) {
                    text(ctx.cs, FONT, 9, MARGIN + 20, innerY, line, TEXT);
                    innerY -= 13;
                }
            }
            innerY -= 5;
        }

        if (report.getVerdict().getFollowUpActions() != null
                && !report.getVerdict().getFollowUpActions().isEmpty()) {
            text(ctx.cs, FONT_BOLD, 8, MARGIN + 16, innerY,
                    "REQUIRES FURTHER VERIFICATION / ACTION", SLATE);
            innerY -= 14;
            for (String action : report.getVerdict().getFollowUpActions()) {
                for (String line : wrap("• " + action, FONT, 9, width - MARGIN * 2 - 44)) {
                    text(ctx.cs, FONT, 9, MARGIN + 20, innerY, line, TEXT);
                    innerY -= 13;
                }
            }
        }

        return boxTop - boxHeight - 10;
    }

    private void footer(PDPageContentStream cs, float width, float margin,
                        int page, int totalPages) throws IOException {
        float y = margin - 14;
        text(cs, FONT, 8, margin, y,
                "Generated by Due Diligence Agent — Autonomous Property Research & Risk Assessment", SLATE);
        String confidential = "CONFIDENTIAL";
        float w = FONT_BOLD.getStringWidth(confidential) / 1000 * 8;
        text(cs, FONT_BOLD, 8, width - margin - w, y, confidential, SLATE);
        String pageLabel = "Page " + page + " of " + totalPages;
        float pw = FONT.getStringWidth(pageLabel) / 1000 * 8;
        text(cs, FONT, 8, (width - pw) / 2, y, pageLabel, SLATE);
    }

    // --- helpers ---

    private record Domain(String name, java.math.BigDecimal score) {
    }

    private void label(PDPageContentStream cs, float x, float y, String text) throws IOException {
        text(cs, FONT_BOLD, 8, x, y, text, SLATE);
    }

    private static void text(PDPageContentStream cs, PDType1Font font, float size,
                      float x, float y, String content, Color color) throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.setNonStrokingColor(color);
        cs.newLineAtOffset(x, y);
        cs.showText(pdfSafe(content));
        cs.endText();
    }

    /** Helvetica (WinAnsi) cannot encode characters like the rupee sign —
     *  map them to ASCII equivalents so rendering never fails. */
    private static String pdfSafe(String content) {
        if (content == null || content.isBlank()) {
            return " ";
        }
        return content.replace("\u20B9", "Rs. ");
    }

    private static void rect(PDPageContentStream cs, float x, float y, float w, float h, Color color)
            throws IOException {
        cs.setNonStrokingColor(color);
        cs.addRect(x, y, w, h);
        cs.fill();
    }

    private Color tierColor(String tier) {
        return switch (tier) {
            case "LOW" -> TEAL;
            case "MODERATE" -> GOLD;
            case "ELEVATED" -> ORANGE;
            case "HIGH" -> ROSE;
            default -> SLATE; // INSUFFICIENT_DATA / UNKNOWN
        };
    }

    private Color scoreColor(double v) {
        if (v >= 55) return ROSE;
        if (v >= 40) return ORANGE;
        if (v >= 20) return GOLD;
        return TEAL;
    }

    private List<String> wrap(String text, PDType1Font font, float size, float maxWidth)
            throws IOException {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return lines;
        }
        String safe = pdfSafe(text);
        for (String paragraph : safe.split("(?<=\\.)\\s+")) {
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
