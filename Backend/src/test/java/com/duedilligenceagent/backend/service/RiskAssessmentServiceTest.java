package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.entities.BuildingPermitDetails;
import com.duedilligenceagent.backend.entities.EnvironmentalDetails;
import com.duedilligenceagent.backend.entities.FloodZoneDetails;
import com.duedilligenceagent.backend.entities.OwnershipDetails;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.entities.TaxDetails;
import com.duedilligenceagent.backend.entities.ZoningDetails;
import com.duedilligenceagent.backend.repositories.BuildingPermitDetailsRepository;
import com.duedilligenceagent.backend.repositories.EnvironmentalDetailsRepository;
import com.duedilligenceagent.backend.repositories.FloodZoneDetailsRepository;
import com.duedilligenceagent.backend.repositories.OwnershipDetailsRepository;
import com.duedilligenceagent.backend.repositories.RiskAssessmentDetailsRepository;
import com.duedilligenceagent.backend.repositories.TaxDetailsRepository;
import com.duedilligenceagent.backend.repositories.ZoningDetailsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Verifies the risk calculation model against the seeded demonstration
 * dataset: the all-clean seed property (1001) must calculate to its seeded
 * baseline (7.75, LOW) and the overdue/high-flood seed property (1004)
 * must land in the HIGH tier.
 */
@ExtendWith(MockitoExtension.class)
class RiskAssessmentServiceTest {

    @Mock private TaxDetailsRepository taxRepository;
    @Mock private FloodZoneDetailsRepository floodRepository;
    @Mock private BuildingPermitDetailsRepository permitRepository;
    @Mock private ZoningDetailsRepository zoningRepository;
    @Mock private EnvironmentalDetailsRepository environmentalRepository;
    @Mock private OwnershipDetailsRepository ownershipRepository;
    @Mock private RiskAssessmentDetailsRepository riskAssessmentRepository;

    @InjectMocks private RiskAssessmentService service;

    private static Property property(long id) {
        return Property.builder().propertyId(id).build();
    }

    private void stubRecords(long propertyId, String taxStatus, String permitStatus,
                             String zoningStatus, String floodLevel, String envStatus,
                             String ownershipType) {
        lenient().when(taxRepository.findByPropertyId(propertyId))
                .thenReturn(taxStatus == null ? List.of()
                        : List.of(TaxDetails.builder().paymentStatus(taxStatus).build()));
        lenient().when(permitRepository.findByPropertyId(propertyId))
                .thenReturn(permitStatus == null ? List.of()
                        : List.of(BuildingPermitDetails.builder().permitStatus(permitStatus).build()));
        lenient().when(zoningRepository.findByPropertyId(propertyId))
                .thenReturn(zoningStatus == null ? List.of()
                        : List.of(ZoningDetails.builder().zoningStatus(zoningStatus).build()));
        lenient().when(floodRepository.findByPropertyId(propertyId))
                .thenReturn(floodLevel == null ? List.of()
                        : List.of(FloodZoneDetails.builder().riskLevel(floodLevel).build()));
        lenient().when(environmentalRepository.findByPropertyId(propertyId))
                .thenReturn(envStatus == null ? List.of()
                        : List.of(EnvironmentalDetails.builder().status(envStatus).build()));
        lenient().when(ownershipRepository.findByPropertyId(propertyId))
                .thenReturn(ownershipType == null ? Optional.empty()
                        : Optional.of(OwnershipDetails.builder().ownershipType(ownershipType).build()));
    }

    @Test
    void cleanSeedPropertyMatchesSeededBaseline() {
        // Seed 1001: PAID, APPROVED, COMPLIANT, LOW flood, CLEAR env, JOINT_OWNERSHIP.
        stubRecords(1001, "PAID", "APPROVED", "COMPLIANT", "LOW", "CLEAR", "JOINT_OWNERSHIP");

        RiskAssessmentDetails result = service.calculate(property(1001));

        assertThat(result.getOverallScore()).isEqualByComparingTo("7.75"); // seeded baseline
        assertThat(RiskAssessmentService.tierOf(result.getOverallScore())).isEqualTo("LOW");
    }

    @Test
    void overdueHighFloodSeedPropertyIsHighRisk() {
        // Seed 1004: OVERDUE, PENDING, PENDING, HIGH flood, FLAGGED env, FREEHOLD.
        stubRecords(1004, "OVERDUE", "PENDING", "PENDING", "HIGH", "FLAGGED", "FREEHOLD");

        RiskAssessmentDetails result = service.calculate(property(1004));

        assertThat(result.getOverallScore()).isEqualByComparingTo("56.50");
        assertThat(RiskAssessmentService.tierOf(result.getOverallScore())).isEqualTo("HIGH");
    }

    @Test
    void partiallyPaidMediumFloodIsModerate() {
        stubRecords(1003, "PARTIALLY_PAID", "COMPLETED", "COMPLIANT", "MEDIUM", "PENDING", "FREEHOLD");

        RiskAssessmentDetails result = service.calculate(property(1003));

        assertThat(RiskAssessmentService.tierOf(result.getOverallScore())).isEqualTo("MODERATE");
    }

    @Test
    void noRecordsAtAllIsInsufficientData() {
        // External-search property before any records exist: no fabricated
        // scores — all domains null, overall null, tier INSUFFICIENT_DATA.
        stubRecords(2000L, null, null, null, null, null, null);
        Property external = Property.builder().propertyId(2000L).build();

        RiskAssessmentDetails result = service.calculate(external);

        assertThat(result.getTaxRisk()).isNull();
        assertThat(result.getFloodRisk()).isNull();
        assertThat(result.getPermitCompliance()).isNull();
        assertThat(result.getZoningCompliance()).isNull();
        assertThat(result.getLegalRisk()).isNull();
        assertThat(result.getOwnershipVerification()).isNull();
        assertThat(result.getOverallScore()).isNull();
        assertThat(RiskAssessmentService.tierOf(result.getOverallScore())).isEqualTo("INSUFFICIENT_DATA");
    }

    @Test
    void partiallyMissingRecordsKeepConservativeDefaults() {
        // Some records exist: missing domains keep the neutral-unknown 50.
        stubRecords(2002L, "PAID", null, null, null, null, null);

        RiskAssessmentDetails result = service.calculate(property(2002L));

        assertThat(result.getTaxRisk()).isEqualByComparingTo("5");   // record present
        assertThat(result.getFloodRisk()).isEqualByComparingTo("50"); // record missing
        assertThat(result.getOwnershipVerification()).isEqualByComparingTo("50");
        assertThat(result.getOverallScore()).isNotNull();
    }

    @Test
    void validatedPremiseWithVerifiedListingReducesOwnershipRisk() {
        // One record present keeps the conservative model; the missing
        // ownership domain is improved by the signals we do have.
        stubRecords(2001L, "PAID", null, null, null, null, null);
        Property external = Property.builder()
                .propertyId(2001L)
                .addressComplete(true)
                .validationGranularity("PREMISE")
                .verified(true)
                .build();

        RiskAssessmentDetails result = service.calculate(external);

        // 50 - 10 (premise-validated address) - 5 (verified listing)
        assertThat(result.getOwnershipVerification()).isEqualByComparingTo("35");
    }

    @Test
    void calculateAndPersistSavesNewRow() {
        stubRecords(1001, "PAID", "APPROVED", "COMPLIANT", "LOW", "CLEAR", "JOINT_OWNERSHIP");
        when(riskAssessmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RiskAssessmentDetails saved = service.calculateAndPersist(property(1001));

        assertThat(saved.getOverallScore()).isEqualByComparingTo(new BigDecimal("7.75"));
        assertThat(saved.getAssessedAt()).isNotNull();
    }

    @Test
    void tierBoundaries() {
        assertThat(RiskAssessmentService.tierOf(BigDecimal.valueOf(19.99))).isEqualTo("LOW");
        assertThat(RiskAssessmentService.tierOf(BigDecimal.valueOf(20))).isEqualTo("MODERATE");
        assertThat(RiskAssessmentService.tierOf(BigDecimal.valueOf(39.99))).isEqualTo("MODERATE");
        assertThat(RiskAssessmentService.tierOf(BigDecimal.valueOf(40))).isEqualTo("ELEVATED");
        assertThat(RiskAssessmentService.tierOf(BigDecimal.valueOf(54.99))).isEqualTo("ELEVATED");
        assertThat(RiskAssessmentService.tierOf(BigDecimal.valueOf(55))).isEqualTo("HIGH");
        assertThat(RiskAssessmentService.tierOf(null)).isEqualTo("INSUFFICIENT_DATA");
    }
}
