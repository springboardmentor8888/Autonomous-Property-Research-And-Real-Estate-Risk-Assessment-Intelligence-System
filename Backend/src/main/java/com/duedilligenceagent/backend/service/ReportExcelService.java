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
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
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
 * <p>
 * Formatting: navy title bands merged across each sheet, bold header rows,
 * regular-weight zebra-striped data rows, real numeric cells (Indian
 * rupee grouping for prices, score/area/count formats), frozen header
 * panes and autofilters on the data sheets, and italic-gray note rows
 * for placeholders so they never read as data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportExcelService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("d MMMM yyyy, h:mm a");
    private static final DateTimeFormatter DATE_ONLY =
            DateTimeFormatter.ofPattern("d MMM yyyy");

    /** Indian-grouping rupee format: ₹16,00,00,000 / ₹1,20,45,000 / ₹7,300. */
    private static final String RUPEE_FORMAT =
            "[>=10000000]\"₹\"##\\,##\\,##\\,##0;[>=100000]\"₹\"##\\,##\\,##0;\"₹\"#,##0";

    private final DiligenceService diligenceService;

    /** All workbook cell styles, created once and reused across sheets. */
    private static final class Styles {
        final CellStyle header;
        final CellStyle label;
        final CellStyle data;
        final CellStyle dataAlt;
        final CellStyle note;
        final CellStyle money;
        final CellStyle integer;
        final CellStyle score;
        final CellStyle textWrap;

        Styles(XSSFWorkbook workbook) {
            header = headerStyle(workbook);
            label = labelStyle(workbook);
            data = dataStyle(workbook, false);
            dataAlt = dataStyle(workbook, true);
            note = noteStyle(workbook);
            money = numberStyle(workbook, RUPEE_FORMAT);
            integer = numberStyle(workbook, "#,##0");
            score = numberStyle(workbook, "0.0#");
            textWrap = wrappedText(workbook);
        }
    }

    public byte[] generate(ReportResponse report) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Styles styles = new Styles(workbook);

            summarySheet(workbook, report, styles);
            riskSheet(workbook, report, styles);
            findingsSheet(workbook, report, styles);
            timelineSheet(workbook, report, styles);
            comparablesSheet(workbook, report, styles);
            marketSheet(workbook, report, styles);
            documentsSheet(workbook, report, styles);

            workbook.write(out);
            log.info("Rendered Excel workbook for report id={} ({} sheets, {} bytes)",
                    report.getReportId(), workbook.getNumberOfSheets(), out.size());
            return out.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to render report Excel workbook: " + ex.getMessage(), ex);
        }
    }

    // --- sheets ---

    private void summarySheet(XSSFWorkbook workbook, ReportResponse report, Styles styles) {
        Sheet sheet = workbook.createSheet("Executive Summary");
        sheet.setColumnWidth(0, 28 * 256);
        sheet.setColumnWidth(1, 70 * 256);

        titleBand(sheet, 0, 2, "DUE DILIGENCE REPORT", styles.header);

        String address = report.getPropertyAddress() != null
                ? report.getPropertyAddress() : "Property #" + report.getPropertyId();
        kv(sheet, 2, "Report #", String.valueOf(report.getReportId()), styles.label);
        kv(sheet, 3, "Property", address, styles.label);
        kv(sheet, 4, "Risk tier", tierLabel(report.getRiskTier()), styles.label);
        kv(sheet, 5, "Status", report.getStatus(), styles.label);
        kv(sheet, 6, "Generated",
                report.getGeneratedAt() == null ? "" : report.getGeneratedAt().format(DATE_FORMAT),
                styles.label);

        if (report.getRisk() != null && report.getRisk().getOverallScore() != null) {
            kv(sheet, 7, "Overall risk score",
                    report.getRisk().getOverallScore().stripTrailingZeros().toPlainString() + " / 100",
                    styles.label);
        }

        // Key findings (point-wise executive summary).
        int row = 9;
        Row findingsLabel = sheet.createRow(row++);
        Cell findingsLabelCell = findingsLabel.createCell(0);
        findingsLabelCell.setCellValue("KEY FINDINGS");
        findingsLabelCell.setCellStyle(styles.label);

        if (report.getSummaryPoints() != null && !report.getSummaryPoints().isEmpty()) {
            for (String point : report.getSummaryPoints()) {
                Row pointRow = sheet.createRow(row++);
                Cell cell = pointRow.createCell(0);
                cell.setCellValue("• " + point);
                cell.setCellStyle(styles.data);
            }
        } else {
            Row summary = sheet.createRow(row++);
            Cell summaryCell = summary.createCell(0);
            summaryCell.setCellValue(report.getExecutiveSummary() == null ? "" : report.getExecutiveSummary());
            summaryCell.setCellStyle(styles.textWrap);
        }

        // Follow-up actions (from the final verdict).
        if (report.getVerdict() != null && report.getVerdict().getFollowUpActions() != null
                && !report.getVerdict().getFollowUpActions().isEmpty()) {
            row++;
            Row actionsLabel = sheet.createRow(row++);
            Cell actionsLabelCell = actionsLabel.createCell(0);
            actionsLabelCell.setCellValue("RECOMMENDED / FOLLOW-UP ACTIONS");
            actionsLabelCell.setCellStyle(styles.label);
            for (String action : report.getVerdict().getFollowUpActions()) {
                Row actionRow = sheet.createRow(row++);
                Cell cell = actionRow.createCell(0);
                cell.setCellValue("• " + action);
                cell.setCellStyle(styles.data);
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
                            + " market trend periods", styles.label);
            if (coverage.getMissingSections() != null && !coverage.getMissingSections().isEmpty()) {
                kv(sheet, row++, "Not yet sourced",
                        String.join(", ", coverage.getMissingSections()), styles.label);
            }
        }
    }

    private void riskSheet(XSSFWorkbook workbook, ReportResponse report, Styles styles) {
        Sheet sheet = workbook.createSheet("Risk Assessment");
        sheet.setColumnWidth(0, 30 * 256);
        sheet.setColumnWidth(1, 12 * 256);
        sheet.setColumnWidth(2, 14 * 256);
        sheet.setColumnWidth(3, 55 * 256);

        titleBand(sheet, 0, 4, "RISK ASSESSMENT (0-100, HIGHER = RISKIER)", styles.header);
        headerRow(sheet, 2, new String[] {"Risk Domain", "Score", "Risk Level", "Finding / Basis"},
                styles.header);
        sheet.createFreezePane(0, 3);
        sheet.setAutoFilter(new CellRangeAddress(2, 2, 0, 3));

        // Detailed rows with level + basis when available.
        if (report.getRiskBasis() != null && !report.getRiskBasis().isEmpty()) {
            int row = 3;
            boolean alt = false;
            for (ReportResponse.RiskBasis basis : report.getRiskBasis()) {
                Row data = sheet.createRow(row++);
                CellStyle rowStyle = alt ? styles.dataAlt : styles.data;
                Cell domainCell = data.createCell(0);
                domainCell.setCellValue(basis.getDomain());
                domainCell.setCellStyle(rowStyle);
                Cell scoreCell = data.createCell(1);
                if (basis.getScore() != null) {
                    scoreCell.setCellValue(basis.getScore().doubleValue());
                    scoreCell.setCellStyle(styles.score);
                } else {
                    scoreCell.setCellValue("No records");
                    scoreCell.setCellStyle(rowStyle);
                }
                Cell levelCell = data.createCell(2);
                levelCell.setCellValue(levelLabel(basis.getLevel()));
                levelCell.setCellStyle(rowStyle);
                Cell basisCell = data.createCell(3);
                basisCell.setCellValue(nullSafe(basis.getBasis()));
                basisCell.setCellStyle(rowStyle);
                alt = !alt;
            }
            return;
        }

        // Fallback: scores only.
        RiskAssessmentResponse risk = report.getRisk();
        if (risk == null) {
            noteRow(sheet, 3, "Risk scores could not be calculated — no diligence records available.",
                    styles.note);
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
        boolean alt = false;
        for (Object[] domain : domains) {
            Row data = sheet.createRow(row++);
            CellStyle rowStyle = alt ? styles.dataAlt : styles.data;
            Cell domainCell = data.createCell(0);
            domainCell.setCellValue((String) domain[0]);
            domainCell.setCellStyle(rowStyle);
            java.math.BigDecimal score = (java.math.BigDecimal) domain[1];
            Cell scoreCell = data.createCell(1);
            if (score != null) {
                scoreCell.setCellValue(score.doubleValue());
                scoreCell.setCellStyle(styles.score);
            } else {
                scoreCell.setCellValue("No records");
                scoreCell.setCellStyle(rowStyle);
            }
            alt = !alt;
        }
    }

    private void findingsSheet(XSSFWorkbook workbook, ReportResponse report, Styles styles) {
        Sheet sheet = workbook.createSheet("Due Diligence Findings");
        sheet.setColumnWidth(0, 22 * 256);
        sheet.setColumnWidth(1, 22 * 256);
        sheet.setColumnWidth(2, 70 * 256);

        titleBand(sheet, 0, 3, "DUE DILIGENCE FINDINGS — AGGREGATED INFORMATION", styles.header);
        headerRow(sheet, 2, new String[] {"Area", "Status", "Key Detail"}, styles.header);
        sheet.createFreezePane(0, 3);
        sheet.setAutoFilter(new CellRangeAddress(2, 2, 0, 2));

        if (report.getFindings() == null || report.getFindings().isEmpty()) {
            noteRow(sheet, 3, "No diligence records on file for this property.", styles.note);
            return;
        }
        int row = 3;
        boolean alt = false;
        for (ReportResponse.Finding finding : report.getFindings()) {
            Row data = sheet.createRow(row++);
            CellStyle rowStyle = alt ? styles.dataAlt : styles.data;
            Cell area = data.createCell(0);
            area.setCellValue(finding.getArea());
            area.setCellStyle(rowStyle);
            Cell status = data.createCell(1);
            status.setCellValue(nullSafe(finding.getStatus()).replaceAll("_", " "));
            status.setCellStyle(rowStyle);
            Cell detail = data.createCell(2);
            detail.setCellValue(nullSafe(finding.getDetail()));
            detail.setCellStyle(rowStyle);
            alt = !alt;
        }
    }

    private void timelineSheet(XSSFWorkbook workbook, ReportResponse report, Styles styles) {
        Sheet sheet = workbook.createSheet("Property Timeline");
        sheet.setColumnWidth(0, 16 * 256);
        sheet.setColumnWidth(1, 18 * 256);
        sheet.setColumnWidth(2, 70 * 256);
        sheet.setColumnWidth(3, 24 * 256);

        titleBand(sheet, 0, 4, "PROPERTY TIMELINE — HISTORICAL EVENTS", styles.header);
        headerRow(sheet, 2, new String[] {"Event Date", "Event Type", "Description", "Source / Reference"},
                styles.header);
        sheet.createFreezePane(0, 3);
        sheet.setAutoFilter(new CellRangeAddress(2, 2, 0, 3));

        if (report.getTimeline() == null || report.getTimeline().isEmpty()) {
            noteRow(sheet, 3, "No dated diligence events on record for this property.", styles.note);
            return;
        }
        int row = 3;
        boolean alt = false;
        for (ReportResponse.TimelineEvent event : report.getTimeline()) {
            Row data = sheet.createRow(row++);
            CellStyle rowStyle = alt ? styles.dataAlt : styles.data;
            Cell date = data.createCell(0);
            date.setCellValue(event.getDate() == null ? "" : event.getDate().format(DATE_ONLY));
            date.setCellStyle(rowStyle);
            Cell type = data.createCell(1);
            type.setCellValue(nullSafe(event.getEventType()).replaceAll("_", " "));
            type.setCellStyle(rowStyle);
            Cell description = data.createCell(2);
            description.setCellValue(nullSafe(event.getDescription()));
            description.setCellStyle(rowStyle);
            Cell source = data.createCell(3);
            source.setCellValue(nullSafe(event.getSource()));
            source.setCellStyle(rowStyle);
            alt = !alt;
        }
    }

    private void comparablesSheet(XSSFWorkbook workbook, ReportResponse report, Styles styles) {
        Sheet sheet = workbook.createSheet("Comparables");
        String[] columns = {"Listing ID", "Locality", "Property Type", "BHK", "Area (sqft)",
                "Price", "Price / sqft", "RERA ID", "Verified"};
        int[] widths = {14, 26, 16, 8, 12, 16, 14, 18, 10};
        for (int i = 0; i < columns.length; i++) {
            sheet.setColumnWidth(i, widths[i] * 256);
        }

        titleBand(sheet, 0, columns.length, "COMPARABLE LISTINGS — MARKET DATASET", styles.header);
        headerRow(sheet, 2, columns, styles.header);
        sheet.createFreezePane(0, 3);
        sheet.setAutoFilter(new CellRangeAddress(2, 2, 0, columns.length - 1));

        List<DiligenceDataResponse.ComparableRecord> comparables =
                diligenceService.getDiligenceData(report.getPropertyId()).getComparables();
        if (comparables == null || comparables.isEmpty()) {
            noteRow(sheet, 3, "No comparable listings stored for this property.", styles.note);
        } else {
            int row = 3;
            boolean alt = false;
            for (DiligenceDataResponse.ComparableRecord comparable : comparables) {
                Row data = sheet.createRow(row++);
                CellStyle rowStyle = alt ? styles.dataAlt : styles.data;
                Cell listingId = data.createCell(0);
                listingId.setCellValue(nullSafe(comparable.getListingId()));
                listingId.setCellStyle(rowStyle);
                Cell locality = data.createCell(1);
                locality.setCellValue(nullSafe(comparable.getLocality()));
                locality.setCellStyle(rowStyle);
                Cell type = data.createCell(2);
                type.setCellValue(nullSafe(comparable.getPropertyType()));
                type.setCellStyle(rowStyle);
                Cell bhk = data.createCell(3);
                bhk.setCellValue(nullSafe(comparable.getBhk()));
                bhk.setCellStyle(rowStyle);
                Cell area = data.createCell(4);
                if (comparable.getAreaSqft() != null) {
                    area.setCellValue(comparable.getAreaSqft());
                    area.setCellStyle(styles.integer);
                } else {
                    area.setCellValue("");
                    area.setCellStyle(rowStyle);
                }
                Cell price = data.createCell(5);
                if (comparable.getPrice() != null) {
                    price.setCellValue(comparable.getPrice().doubleValue());
                    price.setCellStyle(styles.money);
                } else {
                    price.setCellValue("");
                    price.setCellStyle(rowStyle);
                }
                Cell perSqft = data.createCell(6);
                if (comparable.getPricePerSqft() != null) {
                    perSqft.setCellValue(comparable.getPricePerSqft().doubleValue());
                    perSqft.setCellStyle(styles.money);
                } else {
                    perSqft.setCellValue("");
                    perSqft.setCellStyle(rowStyle);
                }
                Cell rera = data.createCell(7);
                rera.setCellValue(nullSafe(comparable.getReraId()));
                rera.setCellStyle(rowStyle);
                Cell verified = data.createCell(8);
                verified.setCellValue(comparable.getVerified() == null
                        ? "" : (comparable.getVerified() ? "Yes" : "No"));
                verified.setCellStyle(rowStyle);
                alt = !alt;
            }
        }

        // Market-positioning note (styled as a note, never as data).
        if (report.getMarketPosition() != null && report.getMarketPosition().getVerdict() != null) {
            int row = sheet.getLastRowNum() + 2;
            String delta = report.getMarketPosition().getDeltaPercent() == null ? ""
                    : report.getMarketPosition().getDeltaPercent().stripTrailingZeros().toPlainString() + "%";
            noteRow(sheet, row, "Market positioning: "
                    + humanVerdict(report.getMarketPosition().getVerdict())
                    + (delta.isEmpty() ? "" : " (" + delta + ")")
                    + (report.getMarketPosition().getBasis() == null
                        ? "" : " — basis: " + report.getMarketPosition().getBasis()),
                    styles.note);
        }
    }

    private void marketSheet(XSSFWorkbook workbook, ReportResponse report, Styles styles) {
        Sheet sheet = workbook.createSheet("Market Analysis");
        String[] columns = {"Locality", "Period", "Avg Price / sqft", "Supply Count", "Demand Pulse"};
        int[] widths = {26, 14, 18, 14, 14};
        for (int i = 0; i < columns.length; i++) {
            sheet.setColumnWidth(i, widths[i] * 256);
        }

        titleBand(sheet, 0, columns.length, "LOCALITY MARKET TRENDS", styles.header);
        headerRow(sheet, 2, columns, styles.header);
        sheet.createFreezePane(0, 3);
        sheet.setAutoFilter(new CellRangeAddress(2, 2, 0, columns.length - 1));

        List<DiligenceDataResponse.MarketTrendRecord> trends =
                diligenceService.getDiligenceData(report.getPropertyId()).getMarketTrends();
        if (trends == null || trends.isEmpty()) {
            noteRow(sheet, 3, "No market trends stored for this property.", styles.note);
        } else {
            int row = 3;
            boolean alt = false;
            for (DiligenceDataResponse.MarketTrendRecord trend : trends) {
                Row data = sheet.createRow(row++);
                CellStyle rowStyle = alt ? styles.dataAlt : styles.data;
                Cell locality = data.createCell(0);
                locality.setCellValue(nullSafe(trend.getLocality()));
                locality.setCellStyle(rowStyle);
                Cell period = data.createCell(1);
                period.setCellValue(nullSafe(trend.getPeriod()));
                period.setCellStyle(rowStyle);
                Cell avg = data.createCell(2);
                if (trend.getAvgPricePerSqft() != null) {
                    avg.setCellValue(trend.getAvgPricePerSqft().doubleValue());
                    avg.setCellStyle(styles.money);
                } else {
                    avg.setCellValue("");
                    avg.setCellStyle(rowStyle);
                }
                Cell supply = data.createCell(3);
                if (trend.getSupplyCount() != null) {
                    supply.setCellValue(trend.getSupplyCount());
                    supply.setCellStyle(styles.integer);
                } else {
                    supply.setCellValue("");
                    supply.setCellStyle(rowStyle);
                }
                Cell pulse = data.createCell(4);
                if (trend.getDemandPulse() != null) {
                    pulse.setCellValue(trend.getDemandPulse().doubleValue());
                    pulse.setCellStyle(styles.score);
                } else {
                    pulse.setCellValue("");
                    pulse.setCellStyle(rowStyle);
                }
                alt = !alt;
            }
        }

        // Market positioning + value-history notes.
        int row = sheet.getLastRowNum() + 2;
        if (report.getMarketPosition() != null && report.getMarketPosition().getVerdict() != null) {
            noteRow(sheet, row++, "Market positioning: "
                    + humanVerdict(report.getMarketPosition().getVerdict())
                    + (report.getMarketPosition().getDeltaPercent() == null
                        ? "" : " (" + report.getMarketPosition().getDeltaPercent()
                                .stripTrailingZeros().toPlainString() + "% vs comparables)"),
                    styles.note);
        }
        if (report.getCoverage() != null && report.getCoverage().getComparablesCount() != null
                && report.getCoverage().getComparablesCount() > 0) {
            noteRow(sheet, row, "Property value history: derived from "
                    + report.getCoverage().getComparablesCount()
                    + " comparable listings on record — see the Comparables sheet.",
                    styles.note);
        }
    }

    private void documentsSheet(XSSFWorkbook workbook, ReportResponse report, Styles styles) {
        Sheet sheet = workbook.createSheet("Supporting Documents");
        String[] columns = {"Document", "Type", "Uploaded", "Status"};
        int[] widths = {40, 20, 24, 14};
        for (int i = 0; i < columns.length; i++) {
            sheet.setColumnWidth(i, widths[i] * 256);
        }

        titleBand(sheet, 0, columns.length, "SUPPORTING DOCUMENTS & EVIDENCE", styles.header);
        headerRow(sheet, 2, columns, styles.header);
        sheet.createFreezePane(0, 3);
        sheet.setAutoFilter(new CellRangeAddress(2, 2, 0, columns.length - 1));

        if (report.getDocuments() == null || report.getDocuments().isEmpty()) {
            noteRow(sheet, 3, "No supporting documents uploaded for this property.", styles.note);
            return;
        }
        int row = 3;
        boolean alt = false;
        for (ReportResponse.DocumentInfo doc : report.getDocuments()) {
            Row data = sheet.createRow(row++);
            CellStyle rowStyle = alt ? styles.dataAlt : styles.data;
            Cell name = data.createCell(0);
            name.setCellValue(nullSafe(doc.getFileName()));
            name.setCellStyle(rowStyle);
            Cell type = data.createCell(1);
            type.setCellValue(nullSafe(doc.getFileType()));
            type.setCellStyle(rowStyle);
            Cell uploaded = data.createCell(2);
            uploaded.setCellValue(doc.getUploadedAt() == null ? "" : doc.getUploadedAt().format(DATE_FORMAT));
            uploaded.setCellStyle(rowStyle);
            Cell status = data.createCell(3);
            status.setCellValue("Available");
            status.setCellStyle(rowStyle);
            alt = !alt;
        }
    }

    // --- helpers ---

    /** Merged navy title band across the sheet's columns. */
    private void titleBand(Sheet sheet, int rowIdx, int colCount, String title, CellStyle style) {
        Row row = sheet.createRow(rowIdx);
        Cell cell = row.createCell(0);
        cell.setCellValue(title);
        cell.setCellStyle(style);
        for (int i = 1; i < colCount; i++) {
            row.createCell(i).setCellStyle(style);
        }
        if (colCount > 1) {
            sheet.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, colCount - 1));
        }
    }

    private void headerRow(Sheet sheet, int rowIdx, String[] headers, CellStyle style) {
        Row row = sheet.createRow(rowIdx);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    /** Italic-gray placeholder/note row — visually distinct from data. */
    private void noteRow(Sheet sheet, int rowIdx, String text, CellStyle noteStyle) {
        Row row = sheet.createRow(rowIdx);
        Cell cell = row.createCell(0);
        cell.setCellValue(text);
        cell.setCellStyle(noteStyle);
    }

    private void kv(Sheet sheet, int rowIdx, String label, String value, CellStyle labelStyle) {
        Row row = sheet.createRow(rowIdx);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);
        row.createCell(1).setCellValue(value == null ? "" : value);
    }

    /** Humanized market-positioning verdict: BELOW_MARKET → below market. */
    private static String humanVerdict(String verdict) {
        if (verdict == null) {
            return "not yet determined";
        }
        return switch (verdict) {
            case "BELOW_MARKET" -> "below market";
            case "ABOVE_MARKET" -> "above market";
            case "ALIGNED" -> "aligned with the market";
            case "NO_COMPARABLES" -> "not yet determined (no comparable listings)";
            default -> verdict.replaceAll("_", " ").toLowerCase();
        };
    }

    private static CellStyle headerStyle(XSSFWorkbook workbook) {
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

    private static CellStyle labelStyle(XSSFWorkbook workbook) {
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

    /** Regular-weight bordered data row, optionally zebra-striped. */
    private static CellStyle dataStyle(XSSFWorkbook workbook, boolean alt) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        if (alt) {
            ((XSSFCellStyle) style).setFillForegroundColor(
                    new XSSFColor(new java.awt.Color(241, 245, 249), null));
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }
        return style;
    }

    /** Italic gray note text for placeholders and annotations. */
    private static CellStyle noteStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setItalic(true);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        return style;
    }

    /** Numeric cell style with a specific number format. */
    private static CellStyle numberStyle(XSSFWorkbook workbook, String format) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat(format));
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private static CellStyle wrappedText(XSSFWorkbook workbook) {
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
            return "NO DATA";
        }
        return "INSUFFICIENT_DATA".equals(level) ? "INSUFFICIENT DATA" : level;
    }

    private static String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
