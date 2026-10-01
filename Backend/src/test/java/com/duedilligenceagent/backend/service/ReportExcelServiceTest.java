package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.DiligenceDataResponse;
import com.duedilligenceagent.backend.dto.ReportResponse;
import com.duedilligenceagent.backend.dto.RiskAssessmentResponse;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Verifies the Excel export (SRS 1.7): the workbook renders the report's
 * summary, risk scores, comparables and market trends into the expected
 * sheets and cells.
 */
@ExtendWith(MockitoExtension.class)
class ReportExcelServiceTest {

    @Mock private DiligenceService diligenceService;

    @InjectMocks private ReportExcelService service;

    private ReportResponse report() {
        return ReportResponse.builder()
                .reportId(55L)
                .propertyId(1001L)
                .propertyAddress("Casagrand Bloom, Thirumudivakkam, Chennai")
                .riskTier("LOW")
                .executiveSummary("All records clean; low risk.")
                .status("COMPLETED")
                .generatedAt(LocalDateTime.of(2026, 10, 1, 12, 0))
                .risk(RiskAssessmentResponse.builder()
                        .overallScore(new BigDecimal("7.75"))
                        .taxRisk(new BigDecimal("5"))
                        .floodRisk(new BigDecimal("5"))
                        .permitCompliance(new BigDecimal("10"))
                        .zoningCompliance(new BigDecimal("10"))
                        .legalRisk(new BigDecimal("5"))
                        .ownershipVerification(new BigDecimal("10"))
                        .build())
                .records(ReportResponse.RecordStatuses.builder()
                        .taxStatus("PAID")
                        .floodRiskLevel("LOW")
                        .build())
                .build();
    }

    private XSSFWorkbook render(ReportResponse report) {
        try {
            byte[] bytes = service.generate(report);
            return new XSSFWorkbook(new ByteArrayInputStream(bytes));
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    @Test
    void generatesWorkbookWithExpectedSheets() throws Exception {
        when(diligenceService.getDiligenceData(1001L))
                .thenReturn(DiligenceDataResponse.builder().build());

        try (XSSFWorkbook workbook = render(report())) {
            assertThat(workbook.getNumberOfSheets()).isEqualTo(4);
            assertThat(workbook.getSheetName(0)).isEqualTo("Summary");
            assertThat(workbook.getSheetName(1)).isEqualTo("Risk Assessment");
            assertThat(workbook.getSheetName(2)).isEqualTo("Comparables");
            assertThat(workbook.getSheetName(3)).isEqualTo("Market Trends");
        }
    }

    @Test
    void summarySheetCarriesReportIdentityAndScore() throws Exception {
        when(diligenceService.getDiligenceData(1001L))
                .thenReturn(DiligenceDataResponse.builder().build());

        try (XSSFWorkbook workbook = render(report())) {
            Sheet summary = workbook.getSheet("Summary");
            assertThat(summary.getRow(2).getCell(1).getStringCellValue()).isEqualTo("55");
            assertThat(summary.getRow(3).getCell(1).getStringCellValue())
                    .isEqualTo("Casagrand Bloom, Thirumudivakkam, Chennai");
            assertThat(summary.getRow(4).getCell(1).getStringCellValue()).isEqualTo("LOW RISK");
            assertThat(summary.getRow(7).getCell(1).getStringCellValue()).isEqualTo("7.75 / 100");
            assertThat(summary.getRow(10).getCell(0).getStringCellValue())
                    .isEqualTo("All records clean; low risk.");
        }
    }

    @Test
    void riskSheetListsAllDomainsWithScores() throws Exception {
        when(diligenceService.getDiligenceData(1001L))
                .thenReturn(DiligenceDataResponse.builder().build());

        try (XSSFWorkbook workbook = render(report())) {
            Sheet risk = workbook.getSheet("Risk Assessment");
            assertThat(risk.getRow(3).getCell(0).getStringCellValue()).isEqualTo("Overall");
            assertThat(risk.getRow(3).getCell(1).getStringCellValue()).isEqualTo("7.75");
            assertThat(risk.getRow(4).getCell(0).getStringCellValue()).isEqualTo("Property Tax");
            assertThat(risk.getRow(4).getCell(1).getStringCellValue()).isEqualTo("5");
            assertThat(risk.getRow(8).getCell(0).getStringCellValue())
                    .isEqualTo("Legal / Environmental");
            assertThat(risk.getRow(9).getCell(0).getStringCellValue())
                    .isEqualTo("Ownership Verification");
        }
    }

    @Test
    void riskSheetHandlesMissingScores() throws Exception {
        ReportResponse noRisk = report();
        noRisk.setRisk(null);
        when(diligenceService.getDiligenceData(1001L))
                .thenReturn(DiligenceDataResponse.builder().build());

        try (XSSFWorkbook workbook = render(noRisk)) {
            Sheet risk = workbook.getSheet("Risk Assessment");
            assertThat(risk.getRow(3).getCell(0).getStringCellValue())
                    .contains("could not be calculated");
        }
    }

    @Test
    void comparablesSheetRendersStoredListings() throws Exception {
        when(diligenceService.getDiligenceData(1001L)).thenReturn(DiligenceDataResponse.builder()
                .comparables(java.util.List.of(
                        DiligenceDataResponse.ComparableRecord.builder()
                                .listingId("L1")
                                .locality("Thirumudivakkam")
                                .propertyType("Apartment")
                                .bhk("3")
                                .areaSqft(1450)
                                .price(new BigDecimal("9500000"))
                                .pricePerSqft(new BigDecimal("6551"))
                                .reraId("RERA-1")
                                .verified(true)
                                .build()))
                .build());

        try (XSSFWorkbook workbook = render(report())) {
            Sheet comparables = workbook.getSheet("Comparables");
            Row data = comparables.getRow(1);
            assertThat(data.getCell(0).getStringCellValue()).isEqualTo("L1");
            assertThat(data.getCell(1).getStringCellValue()).isEqualTo("Thirumudivakkam");
            assertThat(data.getCell(5).getStringCellValue()).isEqualTo("9500000");
            assertThat(data.getCell(8).getStringCellValue()).isEqualTo("Yes");
        }
    }

    @Test
    void comparablesSheetShowsEmptyMessageWhenNoneStored() throws Exception {
        when(diligenceService.getDiligenceData(1001L))
                .thenReturn(DiligenceDataResponse.builder().build());

        try (XSSFWorkbook workbook = render(report())) {
            Sheet comparables = workbook.getSheet("Comparables");
            assertThat(comparables.getRow(1).getCell(0).getStringCellValue())
                    .contains("No comparable listings stored");
        }
    }

    @Test
    void marketSheetRendersStoredTrends() throws Exception {
        when(diligenceService.getDiligenceData(1001L)).thenReturn(DiligenceDataResponse.builder()
                .marketTrends(java.util.List.of(
                        DiligenceDataResponse.MarketTrendRecord.builder()
                                .locality("Thirumudivakkam")
                                .period("2026-Q3")
                                .avgPricePerSqft(new BigDecimal("6600"))
                                .supplyCount(42)
                                .demandPulse(new BigDecimal("0.72"))
                                .build()))
                .build());

        try (XSSFWorkbook workbook = render(report())) {
            Sheet market = workbook.getSheet("Market Trends");
            Row data = market.getRow(1);
            assertThat(data.getCell(0).getStringCellValue()).isEqualTo("Thirumudivakkam");
            assertThat(data.getCell(1).getStringCellValue()).isEqualTo("2026-Q3");
            assertThat(data.getCell(2).getStringCellValue()).isEqualTo("6600");
            assertThat(data.getCell(3).getStringCellValue()).isEqualTo("42");
        }
    }
}
