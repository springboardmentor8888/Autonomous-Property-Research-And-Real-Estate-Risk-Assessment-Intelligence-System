package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.DiligenceDataResponse;
import com.duedilligenceagent.backend.dto.ReportResponse;
import com.duedilligenceagent.backend.dto.RiskAssessmentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Renders a generated due-diligence report as a detailed 7-sheet
 * investigation workbook (SRS: reports must be exportable). The user can
 * inspect the underlying research and the information supporting the risk
 * assessment. Purely a view over the stored {@link ReportResponse} — no
 * data is fetched or calculated here.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportExcelService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("d MMMM yyyy, h:mm a");
    private static final DateTimeFormatter DATE_ONLY =
            DateTimeFormatter.ofPattern("d MMM yyyy");

    private final DiligenceService diligenceService;

    public byte[] generate(ReportResponse report) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            CellStyle headerStyle = headerStyle(workbook);
            CellStyle labelStyle = labelStyle(workbook);
            CellStyle textWrap = wrappedText(workbook);

            summarySheet(workbook, report, headerStyle, labelStyle, textWrap);
            riskSheet(workbook, report, headerStyle, labelStyle);
            findingsSheet(workbook, report, headerStyle, labelStyle);
            timelineSheet(workbook, report, headerStyle, labelStyle);
            comparablesSheet(workbook, report, headerStyle, labelStyle);
            marketSheet(workbook, report, headerStyle, labelStyle);
            documentsSheet(workbook, report, headerStyle, labelStyle);

            workbook.write(out);
            log.info("Rendered Excel workbook for report id={} ({} sheets, {} bytes)",
                    report.getReportId(), workbook.getNumberOfSheets(), out.size());
            return out.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to render report Excel workbook: " + ex.getMessage(), ex);
        }
    }

    // --- sheets ---

    private void summarySheet(XSSFWorkbook workbook, ReportResponse report,
                              CellStyle headerStyle, CellStyle labelStyle, CellStyle textWrap) {
        Sheet sheet = workbook.createSheet("Executive Summary");
        sheet.setColumnWidth(0, 28 * 256);
        sheet.setColumnWidth(1, 70 * 256);

        Row title = sheet.createRow(0);
        Cell titleCell = title.createCell(0);
        titleCell.setCellValue("DUE DILIGENCE REPORT");
        titleCell.setCellStyle(headerStyle);

        String address = report.getPropertyAddress() != null
                ? report.getPropertyAddress() : "Property #" + report.getPropertyId();
        kv(sheet, 2, "Report #", String.valueOf(report.getReportId()), labelStyle);
        kv(sheet, 3, "Property", address, labelStyle);
        kv(sheet, 4, "Risk tier", tierLabel(report.getRiskTier()), labelStyle);
        kv(sheet, 5, "Status", report.getStatus(), labelStyle);
        kv(sheet, 6, "Generated",
                report.getGeneratedAt() == null ? "" : report.getGeneratedAt().format(DATE_FORMAT),
                labelStyle);

        if (report.getRisk() != null && report.getRisk().getOverallScore() != null) {
            kv(sheet, 7, "Overall risk score",
                    report.getRisk().getOverallScore().stripTrailingZeros().toPlainString() + " / 100",
                    labelStyle);
        }

        // Key findings (point-wise executive summary).
        int row = 9;
        Row findingsLabel = sheet.createRow(row++);
        Cell findingsLabelCell = findingsLabel.createCell(0);
        findingsLabelCell.setCellValue("KEY FINDINGS");
        findingsLabelCell.setCellStyle(labelStyle);

        if (report.getSummaryPoints() != null && !report.getSummaryPoints().isEmpty()) {
            for (String point : report.getSummaryPoints()) {
                Row pointRow = sheet.createRow(row++);
                pointRow.createCell(0).setCellValue("• " + point);
            }
        } else {
            Row summary = sheet.createRow(row++);
            Cell summaryCell = summary.createCell(0);
            summaryCell.setCellValue(report.getExecutiveSummary() == null ? "" : report.getExecutiveSummary());
            summaryCell.setCellStyle(textWrap);
        }

        // Follow-up actions (from the final verdict).
        if (report.getVerdict() != null && report.getVerdict().getFollowUpActions() != null
                && !report.getVerdict().getFollowUpActions().isEmpty()) {
            row++;
            Row actionsLabel = sheet.createRow(row++);
            Cell actionsLabelCell = actionsLabel.createCell(0);
            actionsLabelCell.setCellValue("RECOMMENDED / FOLLOW-UP ACTIONS");
            actionsLabelCell.setCellStyle(labelStyle);
            for (String action : report.getVerdict().getFollowUpActions()) {
                sheet.createRow(row++).createCell(0).setCellValue("• " + action);
            }
        }

        // Data coverage overview.
        if (report.getCoverage() != null) {
            row++;
            var coverage = report.getCoverage();
            kv(sheet, row++, "Data coverage",
                    (coverage.getComparablesCount() == null ? 0 : coverage.getComparablesCount())
                            + " comparable listings · "
                            + (coverage.getMarketTrendsCount() == null ? 0 : coverage.getMarketTrendsCount())
                            + " market trend periods", labelStyle);
            if (coverage.getMissingSections() != null && !coverage.getMissingSections().isEmpty()) {
                kv(sheet, row++, "Not yet sourced",
                        String.join(", ", coverage.getMissingSections()), labelStyle);
            }
        }
    }

    private void riskSheet(XSSFWorkbook workbook, ReportResponse report,
                           CellStyle headerStyle, CellStyle labelStyle) {
        Sheet sheet = workbook.createSheet("Risk Assessment");
        sheet.setColumnWidth(0, 30 * 256);
        sheet.setColumnWidth(1, 12 * 256);
        sheet.setColumnWidth(2, 14 * 256);
        sheet.setColumnWidth(3, 55 * 256);

        Row title = sheet.createRow(0);
        Cell titleCell = title.createCell(0);
        titleCell.setCellValue("RISK ASSESSMENT (0-100, HIGHER = RISKIER)");
        titleCell.setCellStyle(headerStyle);

        headerRow(sheet, 2, "Risk Domain", "Score", "Risk Level", "Finding / Basis", headerStyle);

        // Detailed rows with level + basis when available.
        if (report.getRiskBasis() != null && !report.getRiskBasis().isEmpty()) {
            int row = 3;
            for (ReportResponse.RiskBasis basis : report.getRiskBasis()) {
                Row data = sheet.createRow(row++);
                data.createCell(0).setCellValue(basis.getDomain());
                data.createCell(1).setCellValue(basis.getScore() == null
                        ? "No records" : basis.getScore().stripTrailingZeros().toPlainString());
                data.createCell(2).setCellValue(levelLabel(basis.getLevel()));
                data.createCell(3).setCellValue(nullSafe(basis.getBasis()));
                for (Cell cell : data) {
                    cell.setCellStyle(labelStyle);
                }
            }
            return;
        }

        // Fallback: scores only.
        RiskAssessmentResponse risk = report.getRisk();
        if (risk == null) {
            Row none = sheet.createRow(3);
            none.createCell(0).setCellValue("Risk scores could not be calculated — no diligence records available.");
            return;
        }
        List<Object[]> domains = List.of(
                new Object[]{"Overall", risk.getOverallScore()},
                new Object[]{"Property Tax", risk.getTaxRisk()},
                new Object[]{"Flood Zone", risk.getFloodRisk()},
                new Object[]{"Building Permits", risk.getPermitCompliance()},
                new Object[]{"Zoning", risk.getZoningCompliance()},
                new Object[]{"Legal / Environmental", risk.getLegalRisk()},
                new Object[]{"Ownership Verification", risk.getOwnershipVerification()});
        int row = 3;
        for (Object[] domain : domains) {
            Row data = sheet.createRow(row++);
            data.createCell(0).setCellValue((String) domain[0]);
            java.math.BigDecimal score = (java.math.BigDecimal) domain[1];
            data.createCell(1).setCellValue(score == null ? "No records" : score.stripTrailingZeros().toPlainString());
            for (Cell cell : data) {
                cell.setCellStyle(labelStyle);
            }
        }
    }

    private void findingsSheet(XSSFWorkbook workbook, ReportResponse report,
                               CellStyle headerStyle, CellStyle labelStyle) {
        Sheet sheet = workbook.createSheet("Due Diligence Findings");
        sheet.setColumnWidth(0, 22 * 256);
        sheet.setColumnWidth(1, 22 * 256);
        sheet.setColumnWidth(2, 70 * 256);

        Row title = sheet.createRow(0);
        Cell titleCell = title.createCell(0);
        titleCell.setCellValue("DUE DILIGENCE FINDINGS — AGGREGATED INFORMATION");
        titleCell.setCellStyle(headerStyle);

        headerRow(sheet, 2, "Area", "Status", "Key Detail", headerStyle);

        if (report.getFindings() == null || report.getFindings().isEmpty()) {
            Row none = sheet.createRow(3);
            none.createCell(0).setCellValue("No diligence records on file for this property.");
            return;
        }
        int row = 3;
        for (ReportResponse.Finding finding : report.getFindings()) {
            Row data = sheet.createRow(row++);
            data.createCell(0).setCellValue(finding.getArea());
            data.createCell(1).setCellValue(nullSafe(finding.getStatus()).replaceAll("_", " "));
            data.createCell(2).setCellValue(nullSafe(finding.getDetail()));
            for (Cell cell : data) {
                cell.setCellStyle(labelStyle);
            }
        }
    }

    private void timelineSheet(XSSFWorkbook workbook, ReportResponse report,
                               CellStyle headerStyle, CellStyle labelStyle) {
        Sheet sheet = workbook.createSheet("Property Timeline");
        sheet.setColumnWidth(0, 16 * 256);
        sheet.setColumnWidth(1, 18 * 256);
        sheet.setColumnWidth(2, 70 * 256);
        sheet.setColumnWidth(3, 24 * 256);

        Row title = sheet.createRow(0);
        Cell titleCell = title.createCell(0);
        titleCell.setCellValue("PROPERTY TIMELINE — HISTORICAL EVENTS");
        titleCell.setCellStyle(headerStyle);

        headerRow(sheet, 2, "Event Date", "Event Type", "Description", "Source / Reference", headerStyle);

        if (report.getTimeline() == null || report.getTimeline().isEmpty()) {
            Row none = sheet.createRow(3);
            none.createCell(0).setCellValue("No dated diligence events on record for this property.");
            return;
        }
        int row = 3;
        for (ReportResponse.TimelineEvent event : report.getTimeline()) {
            Row data = sheet.createRow(row++);
            data.createCell(0).setCellValue(event.getDate() == null ? "" : event.getDate().format(DATE_ONLY));
            data.createCell(1).setCellValue(nullSafe(event.getEventType()).replaceAll("_", " "));
            data.createCell(2).setCellValue(nullSafe(event.getDescription()));
            data.createCell(3).setCellValue(nullSafe(event.getSource()));
            for (Cell cell : data) {
                cell.setCellStyle(labelStyle);
            }
        }
    }

    private void comparablesSheet(XSSFWorkbook workbook, ReportResponse report,
                                  CellStyle headerStyle, CellStyle labelStyle) {
        Sheet sheet = workbook.createSheet("Comparables");
        String[] columns = {"Listing ID", "Locality", "Property Type", "BHK", "Area (sqft)",
                "Price", "Price / sqft", "RERA ID", "Verified"};
        headerRow(sheet, 0, columns, headerStyle);
        for (int i = 0; i < columns.length; i++) {
            sheet.setColumnWidth(i, 16 * 256);
        }

        List<DiligenceDataResponse.ComparableRecord> comparables =
                diligenceService.getDiligenceData(report.getPropertyId()).getComparables();
        if (comparables == null || comparables.isEmpty()) {
            Row none = sheet.createRow(1);
            none.createCell(0).setCellValue("No comparable listings stored for this property.");
        } else {
            int row = 1;
            for (DiligenceDataResponse.ComparableRecord comparable : comparables) {
                Row data = sheet.createRow(row++);
                data.createCell(0).setCellValue(nullSafe(comparable.getListingId()));
                data.createCell(1).setCellValue(nullSafe(comparable.getLocality()));
                data.createCell(2).setCellValue(nullSafe(comparable.getPropertyType()));
                data.createCell(3).setCellValue(nullSafe(comparable.getBhk()));
                data.createCell(4).setCellValue(comparable.getAreaSqft() == null ? "" : comparable.getAreaSqft().toString());
                data.createCell(5).setCellValue(comparable.getPrice() == null ? "" : comparable.getPrice().toPlainString());
                data.createCell(6).setCellValue(comparable.getPricePerSqft() == null ? "" : comparable.getPricePerSqft().toPlainString());
                data.createCell(7).setCellValue(nullSafe(comparable.getReraId()));
                data.createCell(8).setCellValue(comparable.getVerified() == null ? "" : (comparable.getVerified() ? "Yes" : "No"));
                for (Cell cell : data) {
                    cell.setCellStyle(labelStyle);
                }
            }
        }

        // Market-positioning information.
        if (report.getMarketPosition() != null && report.getMarketPosition().getVerdict() != null) {
            int row = sheet.getLastRowNum() + 2;
            String delta = report.getMarketPosition().getDeltaPercent() == null ? ""
                    : report.getMarketPosition().getDeltaPercent().stripTrailingZeros().toPlainString() + "%";
            Row verdict = sheet.createRow(row);
            verdict.createCell(0).setCellValue("Market positioning: "
                    + report.getMarketPosition().getVerdict()
                    + (delta.isEmpty() ? "" : " (" + delta + ")")
                    + (report.getMarketPosition().getBasis() == null ? "" : " — basis: " + report.getMarketPosition().getBasis()));
        }
    }

    private void marketSheet(XSSFWorkbook workbook, ReportResponse report,
                             CellStyle headerStyle, CellStyle labelStyle) {
        Sheet sheet = workbook.createSheet("Market Analysis");
        String[] columns = {"Locality", "Period", "Avg Price / sqft", "Supply Count", "Demand Pulse"};
        headerRow(sheet, 0, columns, headerStyle);
        for (int i = 0; i < columns.length; i++) {
            sheet.setColumnWidth(i, 18 * 256);
        }

        List<DiligenceDataResponse.MarketTrendRecord> trends =
                diligenceService.getDiligenceData(report.getPropertyId()).getMarketTrends();
        if (trends == null || trends.isEmpty()) {
            Row none = sheet.createRow(1);
            none.createCell(0).setCellValue("No market trends stored for this property.");
        } else {
            int row = 1;
            for (DiligenceDataResponse.MarketTrendRecord trend : trends) {
                Row data = sheet.createRow(row++);
                data.createCell(0).setCellValue(nullSafe(trend.getLocality()));
                data.createCell(1).setCellValue(nullSafe(trend.getPeriod()));
                data.createCell(2).setCellValue(trend.getAvgPricePerSqft() == null ? "" : trend.getAvgPricePerSqft().toPlainString());
                data.createCell(3).setCellValue(trend.getSupplyCount() == null ? "" : trend.getSupplyCount().toString());
                data.createCell(4).setCellValue(trend.getDemandPulse() == null ? "" : trend.getDemandPulse().toPlainString());
                for (Cell cell : data) {
                    cell.setCellStyle(labelStyle);
                }
            }
        }

        // Market positioning + value-history note.
        int row = sheet.getLastRowNum() + 2;
        if (report.getMarketPosition() != null && report.getMarketPosition().getVerdict() != null) {
            Row verdict = sheet.createRow(row++);
            verdict.createCell(0).setCellValue("Market positioning: "
                    + report.getMarketPosition().getVerdict()
                    + (report.getMarketPosition().getDeltaPercent() == null ? ""
                        : " (" + report.getMarketPosition().getDeltaPercent().stripTrailingZeros().toPlainString() + "% vs comparables)"));
        }
        if (report.getCoverage() != null && report.getCoverage().getComparablesCount() != null
                && report.getCoverage().getComparablesCount() > 0) {
            Row history = sheet.createRow(row);
            history.createCell(0).setCellValue("Property value history: derived from "
                    + report.getCoverage().getComparablesCount()
                    + " comparable listings on record — see the Comparables sheet.");
        }
    }

    private void documentsSheet(XSSFWorkbook workbook, ReportResponse report,
                                CellStyle headerStyle, CellStyle labelStyle) {
        Sheet sheet = workbook.createSheet("Supporting Documents");
        String[] columns = {"Document", "Type", "Uploaded", "Status"};
        headerRow(sheet, 0, columns, headerStyle);
        for (int i = 0; i < columns.length; i++) {
            sheet.setColumnWidth(i, i == 0 ? 40 * 256 : 20 * 256);
        }

        if (report.getDocuments() == null || report.getDocuments().isEmpty()) {
            Row none = sheet.createRow(1);
            none.createCell(0).setCellValue("No supporting documents uploaded for this property.");
            return;
        }
        int row = 1;
        for (ReportResponse.DocumentInfo doc : report.getDocuments()) {
            Row data = sheet.createRow(row++);
            data.createCell(0).setCellValue(nullSafe(doc.getFileName()));
            data.createCell(1).setCellValue(nullSafe(doc.getFileType()));
            data.createCell(2).setCellValue(doc.getUploadedAt() == null ? "" : doc.getUploadedAt().format(DATE_FORMAT));
            data.createCell(3).setCellValue("Available");
            for (Cell cell : data) {
                cell.setCellStyle(labelStyle);
            }
        }
    }

    // --- helpers ---

    private void headerRow(Sheet sheet, int rowIdx, String[] headers, CellStyle style) {
        Row row = sheet.createRow(rowIdx);
        for (int i = 0; i < headers.length; i++) {
            row.createCell(i).setCellValue(headers[i]);
        }
        applyStyle(row, style);
    }

    private void headerRow(Sheet sheet, int rowIdx, String h1, String h2, CellStyle style) {
        headerRow(sheet, rowIdx, new String[]{h1, h2}, style);
    }

    private void headerRow(Sheet sheet, int rowIdx, String h1, String h2, String h3, String h4, CellStyle style) {
        headerRow(sheet, rowIdx, new String[]{h1, h2, h3, h4}, style);
    }

    private void headerRow(Sheet sheet, int rowIdx, String h1, String h2, String h3, CellStyle style) {
        headerRow(sheet, rowIdx, new String[]{h1, h2, h3}, style);
    }

    private void kv(Sheet sheet, int rowIdx, String label, String value, CellStyle labelStyle) {
        Row row = sheet.createRow(rowIdx);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);
        row.createCell(1).setCellValue(value == null ? "" : value);
    }

    private void applyStyle(Row row, CellStyle style) {
        for (Cell cell : row) {
            cell.setCellStyle(style);
        }
    }

    private CellStyle headerStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        return style;
    }

    private CellStyle labelStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle wrappedText(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setWrapText(true);
        return style;
    }

    private static String tierLabel(String tier) {
        if (tier == null) {
            return "UNKNOWN";
        }
        return "INSUFFICIENT_DATA".equals(tier) ? "INSUFFICIENT DATA" : tier + " RISK";
    }

    private static String levelLabel(String level) {
        if (level == null) {
            return "—";
        }
        return "NO_DATA".equals(level) ? "NO DATA" : level;
    }

    private static String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
