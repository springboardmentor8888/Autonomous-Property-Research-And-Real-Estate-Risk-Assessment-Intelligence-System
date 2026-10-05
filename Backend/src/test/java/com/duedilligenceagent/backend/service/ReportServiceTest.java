package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.DiligenceDataResponse;
import com.duedilligenceagent.backend.dto.MarketAnalysisResponse;
import com.duedilligenceagent.backend.dto.ReportResponse;
import com.duedilligenceagent.backend.entities.AggregationRun;
import com.duedilligenceagent.backend.entities.DueDiligenceReport;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.repositories.AggregationRunRepository;
import com.duedilligenceagent.backend.repositories.DueDiligenceReportRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.RiskAssessmentDetailsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Verifies the report stage (stage 3): it consumes the outputs of the
 * earlier stages — the latest stored risk assessment (stage 1) and the
 * market analysis (stage 2) — links the latest aggregation run for
 * provenance, and builds the professional executive summary.
 */
@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock private PropertyRepository propertyRepository;
    @Mock private DueDiligenceReportRepository reportRepository;
    @Mock private RiskAssessmentDetailsRepository riskAssessmentRepository;
    @Mock private RiskAssessmentService riskAssessmentService;
    @Mock private DiligenceService diligenceService;
    @Mock private AggregationRunRepository aggregationRunRepository;
    @Mock private MarketAnalysisService marketAnalysisService;

    @InjectMocks private ReportService service;

    private static Property property(long id) {
        Property p = new Property();
        p.setPropertyId(id);
        p.setAddress("Casagrand Bloom, Chennai, Tamil Nadu 600044");
        return p;
    }

    private void stubStages(Property property, RiskAssessmentDetails assessment,
                            DiligenceDataResponse diligence, MarketAnalysisResponse market) {
        when(propertyRepository.findById(property.getPropertyId())).thenReturn(Optional.of(property));
        when(riskAssessmentRepository.findFirstByPropertyIdOrderByAssessedAtDesc(property.getPropertyId()))
                .thenReturn(Optional.of(assessment));
        when(diligenceService.getDiligenceData(property.getPropertyId())).thenReturn(diligence);
        when(marketAnalysisService.analyze(property.getPropertyId())).thenReturn(market);
        when(aggregationRunRepository.findFirstByPropertyIdOrderByStartedAtDesc(property.getPropertyId()))
                .thenReturn(Optional.of(AggregationRun.builder()
                        .aggregationRunId(42L).status("COMPLETED_WITH_GAPS").build()));
        when(aggregationRunRepository.findById(42L))
                .thenReturn(Optional.of(AggregationRun.builder().status("COMPLETED_WITH_GAPS").build()));
        when(reportRepository.save(any(DueDiligenceReport.class)))
                .thenAnswer(inv -> {
                    DueDiligenceReport r = inv.getArgument(0);
                    r.setReportId(7L);
                    return r;
                });
    }

    private static MarketAnalysisResponse noMarket() {
        return MarketAnalysisResponse.builder()
                .positioning(MarketAnalysisResponse.Positioning.builder()
                        .verdict("NO_COMPARABLES")
                        .note("No comparable listings are stored for this property yet.")
                        .build())
                .build();
    }

    private static RiskAssessmentDetails assessment(double overall, double tax, double flood,
                                                    double permit, double zoning, double legal,
                                                    double ownership) {
        return RiskAssessmentDetails.builder()
                .taxRisk(BigDecimal.valueOf(tax))
                .floodRisk(BigDecimal.valueOf(flood))
                .permitCompliance(BigDecimal.valueOf(permit))
                .zoningCompliance(BigDecimal.valueOf(zoning))
                .legalRisk(BigDecimal.valueOf(legal))
                .ownershipVerification(BigDecimal.valueOf(ownership))
                .overallScore(BigDecimal.valueOf(overall))
                .build();
    }

    @Test
    void reportUsesStoredRiskAssessmentWithoutRecalculating() {
        Property property = property(1004);
        RiskAssessmentDetails stored = assessment(56.5, 75, 75, 45, 45, 45, 10);
        stubStages(property, stored, DiligenceDataResponse.builder().build(), noMarket());

        ReportResponse response = service.generate(1004L, 1L);

        // Stage-1 output is reused — the risk engine is NOT re-run.
        verify(riskAssessmentService, never()).calculateAndPersist(any(Property.class));
        assertThat(response.getAggregationRunId()).isEqualTo(42L);
        assertThat(response.getAggregationStatus()).isEqualTo("COMPLETED_WITH_GAPS");
        ArgumentCaptor<DueDiligenceReport> captor = ArgumentCaptor.forClass(DueDiligenceReport.class);
        verify(reportRepository).save(captor.capture());
        assertThat(captor.getValue().getAggregationRunId()).isEqualTo(42L);
    }

    @Test
    void reportRunsRiskStageWhenNoAssessmentStored() {
        Property property = property(1004);
        when(propertyRepository.findById(1004L)).thenReturn(Optional.of(property));
        when(riskAssessmentRepository.findFirstByPropertyIdOrderByAssessedAtDesc(1004L))
                .thenReturn(Optional.empty());
        when(riskAssessmentService.calculateAndPersist(property))
                .thenReturn(assessment(56.5, 75, 75, 45, 45, 45, 10));
        when(diligenceService.getDiligenceData(1004L)).thenReturn(DiligenceDataResponse.builder().build());
        when(marketAnalysisService.analyze(1004L)).thenReturn(noMarket());
        when(aggregationRunRepository.findFirstByPropertyIdOrderByStartedAtDesc(1004L))
                .thenReturn(Optional.empty());
        when(reportRepository.save(any(DueDiligenceReport.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        ReportResponse response = service.generate(1004L, 1L);

        // API robustness: the risk stage runs on demand when it never ran.
        verify(riskAssessmentService).calculateAndPersist(property);
        assertThat(response.getRiskTier()).isEqualTo("HIGH");
    }

    @Test
    void summaryReadsProfessionallyForHighRiskProperty() {
        Property property = property(1004);
        stubStages(property, assessment(56.5, 75, 75, 45, 45, 45, 10),
                DiligenceDataResponse.builder()
                        .ownership(DiligenceDataResponse.OwnershipRecord.builder()
                                .ownershipType("FREEHOLD").build())
                        .tax(DiligenceDataResponse.TaxRecord.builder()
                                .paymentStatus("OVERDUE").build())
                        .permits(List.of(DiligenceDataResponse.PermitRecord.builder()
                                .permitStatus("PENDING").build()))
                        .zoning(DiligenceDataResponse.ZoningRecord.builder()
                                .zoningStatus("PENDING").build())
                        .flood(DiligenceDataResponse.FloodRecord.builder()
                                .riskLevel("HIGH").build())
                        .environmental(DiligenceDataResponse.EnvironmentalRecord.builder()
                                .status("FLAGGED").build())
                        .comparables(List.of(
                                DiligenceDataResponse.ComparableRecord.builder().build(),
                                DiligenceDataResponse.ComparableRecord.builder().build()))
                        .build(),
                noMarket());

        ReportResponse response = service.generate(1004L, 1L);
        String summary = response.getExecutiveSummary();

        assertThat(summary).startsWith("This property presents a high overall risk profile (56.5/100).");
        assertThat(summary).contains("Property tax payments are overdue");
        assertThat(summary).contains("high-risk flood zone");
        assertThat(summary).contains("remains pending approval");
        assertThat(summary).contains("environmental review is flagged");
        assertThat(summary).contains("Ownership is recorded as Freehold");
        assertThat(summary).contains("6 of 8 diligence record types");
        assertThat(summary).contains("2 comparable listings");
        assertThat(summary).doesNotContain("Key concerns:");
    }

    @Test
    void summaryPointsRenderPointWiseForHighRiskProperty() {
        Property property = property(1004);
        stubStages(property, assessment(56.5, 75, 75, 45, 45, 45, 10),
                DiligenceDataResponse.builder()
                        .ownership(DiligenceDataResponse.OwnershipRecord.builder()
                                .ownershipType("FREEHOLD").build())
                        .tax(DiligenceDataResponse.TaxRecord.builder()
                                .paymentStatus("OVERDUE").build())
                        .permits(List.of(DiligenceDataResponse.PermitRecord.builder()
                                .permitStatus("PENDING").build()))
                        .zoning(DiligenceDataResponse.ZoningRecord.builder()
                                .zoningStatus("PENDING").build())
                        .flood(DiligenceDataResponse.FloodRecord.builder()
                                .riskLevel("HIGH").build())
                        .environmental(DiligenceDataResponse.EnvironmentalRecord.builder()
                                .status("FLAGGED").build())
                        .comparables(List.of(
                                DiligenceDataResponse.ComparableRecord.builder().build(),
                                DiligenceDataResponse.ComparableRecord.builder().build()))
                        .build(),
                noMarket());

        ReportResponse response = service.generate(1004L, 1L);
        List<String> points = response.getSummaryPoints();

        assertThat(points).isNotNull();
        assertThat(points).isNotEmpty();
        // Headline bullet carries the tier and score.
        assertThat(points.get(0)).isEqualTo("Overall risk profile: HIGH (56.5/100)");
        // One bullet per material concern.
        assertThat(points).anyMatch(p -> p.contains("Property tax payments are overdue"));
        assertThat(points).anyMatch(p -> p.contains("high-risk flood zone"));
        assertThat(points).anyMatch(p -> p.contains("pending approval"));
        assertThat(points).anyMatch(p -> p.contains("environmental review is flagged"));
        // Ownership bullet.
        assertThat(points).anyMatch(p -> p.contains("Ownership: Freehold"));
        // Data coverage bullet.
        assertThat(points).anyMatch(p -> p.contains("Data coverage: 6 of 8 record types"));
        assertThat(points).anyMatch(p -> p.contains("2 comparable listings"));
    }

    @Test
    void summaryIncludesMarketPositioningWhenComparablesExist() {
        Property property = property(1004);
        stubStages(property, assessment(56.5, 75, 75, 45, 45, 45, 10),
                DiligenceDataResponse.builder().build(),
                MarketAnalysisResponse.builder()
                        .positioning(MarketAnalysisResponse.Positioning.builder()
                                .verdict("BELOW_MARKET")
                                .deltaPercent(BigDecimal.valueOf(-12.5))
                                .basis("total price")
                                .build())
                        .build());

        ReportResponse response = service.generate(1004L, 1L);

        assertThat(response.getExecutiveSummary())
                .contains("priced 12.5% below average");
        assertThat(response.getMarketPosition()).isNotNull();
        assertThat(response.getMarketPosition().getVerdict()).isEqualTo("BELOW_MARKET");
        assertThat(response.getMarketPosition().getDeltaPercent()).isEqualByComparingTo("-12.5");
    }

    @Test
    void summaryIsCleanPhrasedForLowRiskProperty() {
        Property property = property(1001);
        stubStages(property, assessment(7.75, 5, 5, 10, 5, 10, 20),
                DiligenceDataResponse.builder()
                        .ownership(DiligenceDataResponse.OwnershipRecord.builder()
                                .ownershipType("JOINT_OWNERSHIP").build())
                        .tax(DiligenceDataResponse.TaxRecord.builder().paymentStatus("PAID").build())
                        .build(),
                noMarket());

        ReportResponse response = service.generate(1001L, 1L);

        assertThat(response.getExecutiveSummary())
                .startsWith("This property presents a low overall risk profile (7.75/100).")
                .contains("No material concerns were identified")
                .contains("Ownership is recorded as Joint ownership");
    }

    @Test
    void summaryStatesInsufficientDataWhenNoScores() {
        Property property = property(3);
        RiskAssessmentDetails noData = RiskAssessmentDetails.builder().propertyId(3L).build();
        stubStages(property, noData, DiligenceDataResponse.builder().build(), noMarket());

        ReportResponse response = service.generate(3L, 1L);

        assertThat(response.getRiskTier()).isEqualTo("INSUFFICIENT_DATA");
        assertThat(response.getExecutiveSummary())
                .startsWith("No due-diligence records are available for this property yet")
                .contains("unsourced");
    }
}
