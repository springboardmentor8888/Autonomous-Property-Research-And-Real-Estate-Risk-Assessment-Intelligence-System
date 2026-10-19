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
import com.duedilligenceagent.backend.repositories.SupportingDocsRepository;
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
    @Mock private SupportingDocsRepository supportingDocsRepository;

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

    /** Fully-sourced diligence data covering all 7 record areas. */
    private static DiligenceDataResponse fullDiligence() {
        return DiligenceDataResponse.builder()
                .ownership(DiligenceDataResponse.OwnershipRecord.builder()
                        .ownershipType("FREEHOLD").ownerName("Test Owner")
                        .recordDate(java.time.LocalDate.of(2020, 5, 10)).source("Registry")
                        .build())
                .tax(DiligenceDataResponse.TaxRecord.builder()
                        .paymentStatus("OVERDUE")
                        .taxPayDate(java.time.LocalDate.of(2024, 4, 1))
                        .taxAmount(new BigDecimal("25000"))
                        .taxDue(new BigDecimal("8000"))
                        .source("Municipal")
                        .build())
                .permits(List.of(DiligenceDataResponse.PermitRecord.builder()
                        .permitNumber("BP-2024-11").permitType("Construction")
                        .permitStatus("PENDING")
                        .issueDate(java.time.LocalDate.of(2024, 6, 1))
                        .build()))
                .zoning(DiligenceDataResponse.ZoningRecord.builder()
                        .zoningCode("R1").zoningStatus("PENDING").allowedUse("Residential")
                        .effectiveFrom(java.time.LocalDate.of(2018, 1, 1))
                        .build())
                .flood(DiligenceDataResponse.FloodRecord.builder()
                        .zone("ZONE-3").riskLevel("HIGH")
                        .effectiveDate(java.time.LocalDate.of(2019, 11, 15))
                        .build())
                .environmental(DiligenceDataResponse.EnvironmentalRecord.builder()
                        .recordType("CLEARANCE").status("FLAGGED")
                        .description("Environmental review flagged for site inspection")
                        .build())
                .utilities(List.of(DiligenceDataResponse.UtilityRecord.builder()
                        .utilityType("Water").provider("Metro Water")
                        .availabilityStatus("AVAILABLE")
                        .build()))
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
    void verdictCarriesTierHeadlineConcernsAndActions() {
        Property property = property(1004);
        stubStages(property, assessment(56.5, 75, 75, 45, 45, 45, 10),
                fullDiligence(), noMarket());

        ReportResponse response = service.generate(1004L, 1L);
        ReportResponse.Verdict verdict = response.getVerdict();

        assertThat(verdict).isNotNull();
        // HIGH tier headline.
        assertThat(verdict.getHeadline()).isEqualTo(
                "High risk — proceed only after resolving the material concerns");
        // Major concerns mirror the material concerns.
        assertThat(verdict.getMajorConcerns()).isNotEmpty();
        assertThat(verdict.getMajorConcerns()).anyMatch(c -> c.contains("Property tax payments are overdue"));
        assertThat(verdict.getMajorConcerns()).anyMatch(c -> c.contains("high-risk flood zone"));
        // Follow-up actions per flagged domain.
        assertThat(verdict.getFollowUpActions()).isNotEmpty();
        assertThat(verdict.getFollowUpActions()).anyMatch(a -> a.contains("tax clearance"));
        assertThat(verdict.getFollowUpActions()).anyMatch(a -> a.contains("flood-zone insurance"));
        assertThat(verdict.getFollowUpActions()).anyMatch(a -> a.contains("building-permit approval"));
    }

    @Test
    void verdictForLowRiskPropertyIsFavorable() {
        Property property = property(1001);
        stubStages(property, assessment(7.75, 5, 5, 10, 10, 5, 10),
                fullDiligence(), noMarket());

        ReportResponse response = service.generate(1001L, 1L);
        ReportResponse.Verdict verdict = response.getVerdict();

        assertThat(verdict).isNotNull();
        assertThat(verdict.getHeadline()).isEqualTo(
                "Favorable for purchase — no material concerns identified");
        assertThat(verdict.getMajorConcerns()).isEmpty();
        // No flagged domains, but comparables/trends are absent from the
        // stub data — sourcing them is the only follow-up action.
        assertThat(verdict.getFollowUpActions()).containsExactly(
                "Source the unavailable sections: comparable listings, market trends");
    }

    @Test
    void timelineDerivesEventsFromDiligenceDates() {
        Property property = property(1004);
        stubStages(property, assessment(56.5, 75, 75, 45, 45, 45, 10),
                DiligenceDataResponse.builder()
                        .ownership(DiligenceDataResponse.OwnershipRecord.builder()
                                .ownershipType("FREEHOLD").ownerName("Test Owner")
                                .recordDate(java.time.LocalDate.of(2020, 5, 10)).source("Registry")
                                .build())
                        .tax(DiligenceDataResponse.TaxRecord.builder()
                                .paymentStatus("OVERDUE")
                                .taxPayDate(java.time.LocalDate.of(2024, 4, 1))
                                .build())
                        .flood(DiligenceDataResponse.FloodRecord.builder()
                                .zone("ZONE-3").riskLevel("HIGH")
                                .effectiveDate(java.time.LocalDate.of(2019, 11, 15))
                                .build())
                        .build(),
                noMarket());

        ReportResponse response = service.generate(1004L, 1L);
        List<ReportResponse.TimelineEvent> timeline = response.getTimeline();

        assertThat(timeline).hasSize(3);
        // Newest first.
        assertThat(timeline.get(0).getDate()).isEqualTo(java.time.LocalDate.of(2024, 4, 1));
        assertThat(timeline.get(0).getEventType()).isEqualTo("TAX");
        assertThat(timeline.get(1).getEventType()).isEqualTo("OWNERSHIP");
        assertThat(timeline.get(1).getDescription()).contains("Test Owner");
        assertThat(timeline.get(2).getEventType()).isEqualTo("FLOOD_ZONE");
        // Zone prefix stripped — "zone ZONE-3" reads badly.
        assertThat(timeline.get(2).getDescription()).contains("zone 3,");
    }

    @Test
    void findingsCoverSourcedDiligenceAreas() {
        Property property = property(1004);
        stubStages(property, assessment(56.5, 75, 75, 45, 45, 45, 10),
                fullDiligence(), noMarket());

        ReportResponse response = service.generate(1004L, 1L);
        List<ReportResponse.Finding> findings = response.getFindings();

        assertThat(findings).isNotNull();
        // One finding per sourced area.
        assertThat(findings).extracting(ReportResponse.Finding::getArea)
                .containsExactlyInAnyOrder("Ownership", "Property Tax", "Building Permits",
                        "Zoning", "Flood", "Environmental", "Utilities");
        // Statuses carry the record values.
        assertThat(findings).filteredOn(f -> f.getArea().equals("Property Tax"))
                .allSatisfy(f -> assertThat(f.getStatus()).isEqualTo("OVERDUE"));
        assertThat(findings).filteredOn(f -> f.getArea().equals("Flood"))
                .allSatisfy(f -> assertThat(f.getStatus()).isEqualTo("HIGH"));
    }

    @Test
    void riskBasisCarriesScoreLevelAndBasisPerDomain() {
        Property property = property(1004);
        stubStages(property, assessment(56.5, 75, 75, 45, 45, 45, 10),
                fullDiligence(), noMarket());

        ReportResponse response = service.generate(1004L, 1L);
        List<ReportResponse.RiskBasis> basis = response.getRiskBasis();

        assertThat(basis).isNotNull();
        assertThat(basis).extracting(ReportResponse.RiskBasis::getDomain)
                .contains("Overall", "Property Tax", "Flood", "Building Permits",
                        "Zoning", "Legal / Environmental", "Ownership Verification");
        // Overall row: score + level.
        ReportResponse.RiskBasis overall = basis.stream()
                .filter(b -> b.getDomain().equals("Overall")).findFirst().orElseThrow();
        assertThat(overall.getScore().toPlainString()).isEqualTo("56.5");
        assertThat(overall.getLevel()).isEqualTo("HIGH");
        // Tax row carries a basis line.
        ReportResponse.RiskBasis tax = basis.stream()
                .filter(b -> b.getDomain().equals("Property Tax")).findFirst().orElseThrow();
        assertThat(tax.getBasis()).contains("overdue");
    }

    @Test
    void documentsListSupportingDocsForProperty() {
        Property property = property(1004);
        stubStages(property, assessment(56.5, 75, 75, 45, 45, 45, 10),
                fullDiligence(), noMarket());
        when(supportingDocsRepository.findByPropertyIdOrderByUploadedAtDesc(1004L))
                .thenReturn(List.of(
                        com.duedilligenceagent.backend.entities.SupportingDocs.builder()
                                .documentId(1L).fileName("title-deed.pdf").fileType("application/pdf")
                                .build()));

        ReportResponse response = service.generate(1004L, 1L);
        List<ReportResponse.DocumentInfo> documents = response.getDocuments();

        assertThat(documents).hasSize(1);
        assertThat(documents.get(0).getFileName()).isEqualTo("title-deed.pdf");
        assertThat(documents.get(0).getFileType()).isEqualTo("application/pdf");
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

    @Test
    void taxDetailShowsSingleFigureWhenAmountMatchesDue() {
        Property property = property(1004);
        DiligenceDataResponse diligence = fullDiligence().toBuilder()
                .tax(DiligenceDataResponse.TaxRecord.builder()
                        .paymentStatus("OVERDUE")
                        .taxAmount(new BigDecimal("31100"))
                        .taxDue(new BigDecimal("31100"))
                        .build())
                .build();
        stubStages(property, assessment(56.5, 75, 75, 45, 45, 45, 10), diligence, noMarket());

        ReportResponse response = service.generate(1004L, 1L);

        assertThat(response.getFindings())
                .filteredOn(f -> f.getArea().equals("Property Tax"))
                .first()
                .satisfies(f -> {
                    assertThat(f.getDetail()).isEqualTo("₹31100 due");
                    assertThat(f.getDetail()).doesNotContain("Amount");
                });
    }

    @Test
    void zoneDisplayStripsRedundantPrefix() {
        Property property = property(1004);
        stubStages(property, assessment(56.5, 75, 75, 45, 45, 45, 10),
                fullDiligence(), noMarket());

        ReportResponse response = service.generate(1004L, 1L);

        // "Zone ZONE-3" reads badly — the prefix is stripped to "Zone 3".
        assertThat(response.getFindings())
                .filteredOn(f -> f.getArea().equals("Flood"))
                .first()
                .satisfies(f -> assertThat(f.getDetail()).isEqualTo("Zone 3"));
        assertThat(response.getTimeline())
                .filteredOn(e -> e.getEventType().equals("FLOOD_ZONE"))
                .first()
                .satisfies(e -> assertThat(e.getDescription()).contains("zone 3,"));
        assertThat(response.getRiskBasis())
                .filteredOn(b -> b.getDomain().equals("Flood"))
                .first()
                .satisfies(b -> assertThat(b.getBasis()).startsWith("Zone 3,"));
    }

    @Test
    void comparablesCarryTheMarketDataset() {
        Property property = property(1004);
        DiligenceDataResponse diligence = fullDiligence().toBuilder()
                .comparables(List.of(
                        DiligenceDataResponse.ComparableRecord.builder()
                                .listingId("LIST-1003").locality("Casagrand Savoye")
                                .propertyType("RESIDENTIAL").bhk("3BHK").areaSqft(1650)
                                .price(new BigDecimal("12045000"))
                                .pricePerSqft(new BigDecimal("7300"))
                                .build()))
                .build();
        stubStages(property, assessment(56.5, 75, 75, 45, 45, 45, 10), diligence, noMarket());

        ReportResponse response = service.generate(1004L, 1L);

        assertThat(response.getComparables()).hasSize(1);
        ReportResponse.ComparableListing comp = response.getComparables().get(0);
        assertThat(comp.getListingId()).isEqualTo("LIST-1003");
        assertThat(comp.getLocality()).isEqualTo("Casagrand Savoye");
        assertThat(comp.getPricePerSqft()).isEqualByComparingTo("7300");
    }

    @Test
    void reportListShowsOnlyTheLatestReportPerProperty() {
        // Two generations for property 1004 (regeneration appends history
        // rows) and one for property 1001 — the list must present one
        // card per property: its newest report.
        DueDiligenceReport older1004 = DueDiligenceReport.builder()
                .reportId(1L).propertyId(1004L).generatedBy(1L)
                .generatedAt(java.time.LocalDateTime.of(2026, 10, 8, 10, 0))
                .status("COMPLETED")
                .build();
        DueDiligenceReport latest1004 = DueDiligenceReport.builder()
                .reportId(3L).propertyId(1004L).generatedBy(1L)
                .generatedAt(java.time.LocalDateTime.of(2026, 10, 10, 8, 27))
                .status("COMPLETED")
                .build();
        DueDiligenceReport only1001 = DueDiligenceReport.builder()
                .reportId(2L).propertyId(1001L).generatedBy(1L)
                .generatedAt(java.time.LocalDateTime.of(2026, 10, 9, 9, 0))
                .status("COMPLETED")
                .build();

        when(reportRepository.findByGeneratedByOrderByGeneratedAtDesc(1L))
                .thenReturn(List.of(latest1004, only1001, older1004));
        when(propertyRepository.findById(1004L)).thenReturn(Optional.of(property(1004)));
        when(propertyRepository.findById(1001L)).thenReturn(Optional.of(property(1001)));
        when(diligenceService.getDiligenceData(any())).thenReturn(DiligenceDataResponse.builder().build());
        when(marketAnalysisService.analyze(any())).thenReturn(noMarket());
        when(supportingDocsRepository.findByPropertyIdOrderByUploadedAtDesc(any())).thenReturn(List.of());

        List<ReportResponse> reports = service.listForUser(1L);

        assertThat(reports).hasSize(2);
        // Newest-first ordering preserved: 1004 (Oct 10) before 1001 (Oct 9).
        assertThat(reports.get(0).getReportId()).isEqualTo(3L);
        assertThat(reports.get(1).getReportId()).isEqualTo(2L);
        // The older 1004 generation is not listed.
        assertThat(reports).extracting(ReportResponse::getReportId)
                .doesNotContain(1L);
    }
}
