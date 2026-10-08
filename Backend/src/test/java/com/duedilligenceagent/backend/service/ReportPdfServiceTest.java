package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.ReportResponse;
import com.duedilligenceagent.backend.dto.RiskAssessmentResponse;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

/**
 * Layout regression tests for the client-facing PDF report. The render
 * cursor bugs these guard against: page breaks that never fire mid-section
 * (content drawn off-page and over the footer), section headings lost
 * off-page, and the rupee mapping splitting wrapped lines mid-amount.
 */
class ReportPdfServiceTest {

    private static final float FOOTER_BASELINE = 36f;

    private final ReportPdfService service = new ReportPdfService();

    /** One extracted text line with its page and baseline y (PDF bottom-origin). */
    private record Line(int page, float y, String text) {
        boolean contains(String needle) {
            return text.contains(needle);
        }
    }

    /** Extracts every text line with its position, via a position-aware stripper. */
    private static List<Line> lines(PDDocument doc) throws IOException {
        List<Line> collected = new ArrayList<>();
        PDFTextStripper stripper = new PDFTextStripper() {
            @Override
            protected void writeString(String text, List<TextPosition> positions) {
                if (!text.isBlank() && !positions.isEmpty()) {
                    collected.add(new Line(getCurrentPageNo(),
                            positions.get(0).getY(), text.trim()));
                }
            }
        };
        stripper.getText(doc);
        return collected;
    }

    /** Dense, fully-sourced report that forces multi-page rendering. */
    private static ReportResponse denseReport() {
        return ReportResponse.builder()
                .reportId(11075L)
                .propertyId(1004L)
                .propertyAddress("Casagrand Bloom, Thirumudivakkam, Chennai, Tamil Nadu 600044")
                .riskTier("HIGH")
                .status("COMPLETED")
                .generatedAt(LocalDateTime.of(2026, 10, 8, 16, 9))
                .propertyInfo(ReportResponse.PropertyInfo.builder()
                        .propertyType("RESIDENTIAL")
                        .locality("Thirumudivakkam")
                        .city("Chennai")
                        .price(new BigDecimal("6250000"))
                        .build())
                .risk(RiskAssessmentResponse.builder()
                        .overallScore(BigDecimal.valueOf(56.5))
                        .taxRisk(BigDecimal.valueOf(75))
                        .floodRisk(BigDecimal.valueOf(75))
                        .permitCompliance(BigDecimal.valueOf(45))
                        .zoningCompliance(BigDecimal.valueOf(45))
                        .legalRisk(BigDecimal.valueOf(45))
                        .ownershipVerification(BigDecimal.valueOf(10))
                        .build())
                .summaryPoints(List.of(
                        "Overall risk profile: HIGH (56.5/100)",
                        "Property tax payments are overdue",
                        "The property lies in a high-risk flood zone",
                        "On building permits, the latest permit remains pending approval",
                        "Zoning compliance is pending review",
                        "The environmental review is flagged",
                        "Ownership: Freehold",
                        "Data coverage: 7 of 8 record types · 2 comparable listings · missing: market trends"))
                .marketPosition(ReportResponse.MarketPosition.builder()
                        .verdict("BELOW_MARKET")
                        .deltaPercent(BigDecimal.valueOf(-4.2))
                        .build())
                .timeline(List.of(
                        event(LocalDate.of(2026, 6, 1), "FLOOD_ZONE",
                                "Flood-zone designation — zone A, high risk"),
                        event(LocalDate.of(2024, 6, 15), "OWNERSHIP",
                                "Ownership recorded as Freehold — Test Owner"),
                        event(LocalDate.of(2022, 2, 10), "PERMIT",
                                "Building permit BP-1004-A pending"),
                        event(LocalDate.of(2020, 1, 1), "ZONING",
                                "Zoning R-103 effective — Residential / Group Housing"),
                        event(LocalDate.of(2019, 4, 2), "TAX",
                                "Property tax payment — overdue")))
                .findings(List.of(
                        finding("Ownership", "FREEHOLD", "Owner: Test Owner"),
                        finding("Property Tax", "OVERDUE", "Amount ₹25000 · Due ₹8000"),
                        finding("Building Permits", "PENDING", "Permit BP-1004-A · Construction"),
                        finding("Zoning", "PENDING", "Code R-103 · Allowed: Residential / Group Housing"),
                        finding("Flood", "HIGH", "Zone A"),
                        finding("Environmental", "FLAGGED", "Environmental review flagged for site inspection"),
                        finding("Utilities", "3 on record", "Water (available), Sewer (available), Power (available)")))
                .comparables(List.of(
                        comparable("LIST-1003", "Casagrand Savoye", "RESIDENTIAL", "3BHK",
                                1650, "12045000", "7300"),
                        comparable("LIST-1005", "Casagrand Westend", "LAND", "LAND",
                                20000, "160000000", "8000"),
                        comparable("LIST-1009", "Purva Windermere", "RESIDENTIAL", "2BHK",
                                1180, "7850000", "6652")))
                .verdict(ReportResponse.Verdict.builder()
                        .headline("High risk — proceed only after resolving the material concerns")
                        .majorConcerns(List.of(
                                "Property tax payments are overdue",
                                "The property lies in a high-risk flood zone",
                                "On building permits, the latest permit remains pending approval",
                                "Zoning compliance is pending review",
                                "The environmental review is flagged"))
                        .followUpActions(List.of(
                                "Obtain an up-to-date tax clearance and settle any outstanding dues",
                                "Review flood-zone insurance requirements and mitigation measures",
                                "Follow up on the pending building-permit approval with the local authority",
                                "Confirm the zoning status and permitted use with the planning authority",
                                "Obtain the environmental clearance record for legal review",
                                "Source the unavailable sections: market trends"))
                        .build())
                .coverage(ReportResponse.DataCoverage.builder()
                        .comparablesCount(3)
                        .marketTrendsCount(0)
                        .missingSections(List.of("market trends"))
                        .build())
                .build();
    }

    private static ReportResponse.TimelineEvent event(LocalDate date, String type, String description) {
        return ReportResponse.TimelineEvent.builder()
                .date(date).eventType(type).description(description).build();
    }

    private static ReportResponse.Finding finding(String area, String status, String detail) {
        return ReportResponse.Finding.builder()
                .area(area).status(status).detail(detail).build();
    }

    private static ReportResponse.ComparableListing comparable(String listingId, String locality,
                                                               String type, String bhk,
                                                               int areaSqft, String price,
                                                               String perSqft) {
        return ReportResponse.ComparableListing.builder()
                .listingId(listingId).locality(locality).propertyType(type).bhk(bhk)
                .areaSqft(areaSqft).price(new BigDecimal(price))
                .pricePerSqft(new BigDecimal(perSqft)).build();
    }

    @Test
    void rendersEverySectionAndFindingAcrossPages() throws IOException {
        ReportResponse report = denseReport();
        byte[] pdf = service.generate(report);

        try (PDDocument doc = Loader.loadPDF(pdf)) {
            List<Line> lines = lines(doc);
            String all = lines.stream().map(Line::text)
                    .reduce("", (a, b) -> a + "\n" + b);

            // Multi-page: the dense report must paginate, not compress off-page.
            assertThat(doc.getNumberOfPages()).isGreaterThanOrEqualTo(2);

            // Every section heading survives rendering (none lost off-page).
            List.of("PROPERTY OVERVIEW", "RISK OVERVIEW", "RISK ASSESSMENT",
                            "EXECUTIVE SUMMARY", "DUE DILIGENCE FINDINGS", "PROPERTY TIMELINE",
                            "COMPARABLE & MARKET ANALYSIS", "DATA COVERAGE",
                            "FINAL DUE DILIGENCE ASSESSMENT")
                    .forEach(heading -> assertThat(all).contains(heading));

            // Every finding area renders — the old cursor bug silently
            // dropped the findings that fell past the page bottom.
            report.getFindings().forEach(finding ->
                    assertThat(all).contains(finding.getArea()));

            // Every timeline event description renders.
            report.getTimeline().forEach(ev ->
                    assertThat(all).contains(ev.getDescription()));

            // Comparables table renders with its localities.
            report.getComparables().forEach(comp ->
                    assertThat(all).contains(comp.getLocality()));
        }
    }

    @Test
    void keepsContentAboveTheFooterZoneOnEveryPage() throws IOException {
        ReportResponse report = denseReport();
        byte[] pdf = service.generate(report);

        try (PDDocument doc = Loader.loadPDF(pdf)) {
            List<Line> lines = lines(doc);
            assertThat(lines).isNotEmpty();

            // Content baselines must stay at or above the bottom margin
            // (50pt); only the footer may sit below it (baseline 36).
            // This is the invariant the old stale-cursor bug violated:
            // findings rendered down to y≈3 and over the footer.
            for (Line line : lines) {
                assertThat(line.y())
                        .as("page %d text '%s' overlaps the footer zone", line.page(), line.text())
                        .satisfiesAnyOf(
                                y -> assertThat(y).isGreaterThanOrEqualTo(50f),
                                y -> assertThat(y).isCloseTo(FOOTER_BASELINE, within(0.5f)));
            }
        }
    }

    @Test
    void wrapsRupeeAmountsWithoutSplittingLines() throws IOException {
        ReportResponse report = denseReport();
        byte[] pdf = service.generate(report);

        try (PDDocument doc = Loader.loadPDF(pdf)) {
            List<Line> lines = lines(doc);

            // "Amount ₹25000 · Due ₹8000" must stay on ONE line — the old
            // sentence-split wrap broke it into "Amount Rs." / "25000 · Due Rs." / "8000".
            boolean oneLine = lines.stream().anyMatch(line ->
                    line.contains("25000") && line.contains("8000"));
            assertThat(oneLine)
                    .as("tax amounts must not be split across lines")
                    .isTrue();
        }
    }

    @Test
    void rendersMinimalReportOnASinglePage() throws IOException {
        ReportResponse report = ReportResponse.builder()
                .reportId(1L)
                .propertyId(2L)
                .propertyAddress("Test Property, Chennai")
                .riskTier("INSUFFICIENT_DATA")
                .status("COMPLETED")
                .generatedAt(LocalDateTime.of(2026, 10, 8, 9, 0))
                .build();

        byte[] pdf = service.generate(report);

        try (PDDocument doc = Loader.loadPDF(pdf)) {
            assertThat(doc.getNumberOfPages()).isEqualTo(1);
            List<Line> lines = lines(doc);
            String all = lines.stream().map(Line::text)
                    .reduce("", (a, b) -> a + "\n" + b);
            assertThat(all).contains("DUE DILIGENCE REPORT");
            assertThat(all).contains("Test Property, Chennai");
            // Sections with no data are omitted, not rendered empty.
            assertThat(all).doesNotContain("DUE DILIGENCE FINDINGS");
            assertThat(all).doesNotContain("PROPERTY TIMELINE");
        }
    }
}
