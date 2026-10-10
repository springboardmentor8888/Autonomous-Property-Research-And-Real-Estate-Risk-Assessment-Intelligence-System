package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.DiligenceDataResponse;
import com.duedilligenceagent.backend.dto.PropertyResponse;
import com.duedilligenceagent.backend.dto.UserDashboardResponse;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.PropertyMonitoring;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.repositories.PropertyMonitoringRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.RiskAssessmentDetailsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Verifies the role-dashboard aggregations: every payload is scoped to
 * the caller's own search history, the review queue flags elevated
 * legal/permit/zoning positions and pending statuses, and the portfolio
 * distribution buckets by the risk engine's own tiers.
 */
@ExtendWith(MockitoExtension.class)
class UserDashboardServiceTest {

    private static final Long USER_ID = 7L;

    @Mock private PropertyService propertyService;
    @Mock private PropertyRepository propertyRepository;
    @Mock private PropertyMonitoringRepository monitoringRepository;
    @Mock private RiskAssessmentDetailsRepository riskAssessmentRepository;
    @Mock private DiligenceService diligenceService;

    @InjectMocks private UserDashboardService service;

    // --- monitoredProperties ---

    @Test
    void monitoredListCarriesPropertyIdentity() {
        PropertyMonitoring monitoring = PropertyMonitoring.builder()
                .monitoringId(1L).propertyId(1004L).userId(USER_ID).enabled(true)
                .createdAt(LocalDateTime.of(2026, 9, 27, 10, 0))
                .lastCheckedAt(LocalDateTime.of(2026, 10, 8, 22, 50))
                .build();
        when(monitoringRepository.findByUserIdAndEnabledTrue(USER_ID)).thenReturn(List.of(monitoring));
        when(propertyRepository.findById(1004L)).thenReturn(Optional.of(property(1004L,
                "Casagrand Bloom, Thirumudivakkam, Chennai", "Chennai")));

        List<UserDashboardResponse.MonitoredProperty> monitored = service.monitoredProperties(USER_ID);

        assertThat(monitored).hasSize(1);
        assertThat(monitored.get(0).propertyId()).isEqualTo(1004L);
        assertThat(monitored.get(0).address()).contains("Casagrand Bloom");
        assertThat(monitored.get(0).city()).isEqualTo("Chennai");
        assertThat(monitored.get(0).monitoredSince()).isEqualTo(LocalDateTime.of(2026, 9, 27, 10, 0));
    }

    @Test
    void monitoredListSkipsDeletedProperties() {
        when(monitoringRepository.findByUserIdAndEnabledTrue(USER_ID)).thenReturn(List.of(
                PropertyMonitoring.builder().propertyId(999L).userId(USER_ID).build()));
        when(propertyRepository.findById(999L)).thenReturn(Optional.empty());

        assertThat(service.monitoredProperties(USER_ID)).isEmpty();
    }

    // --- reviewQueue ---

    @Test
    void reviewQueueFlagsElevatedDomainsAndPendingStatuses() {
        stubHistory(propertyResponse(1004L, "Casagrand Bloom", "Chennai"));
        when(riskAssessmentRepository.findFirstByPropertyIdOrderByAssessedAtDesc(1004L))
                .thenReturn(Optional.of(RiskAssessmentDetails.builder()
                        .legalRisk(BigDecimal.valueOf(45))
                        .permitCompliance(BigDecimal.valueOf(45))
                        .zoningCompliance(BigDecimal.valueOf(20))
                        .build()));
        lenient().when(diligenceService.getDiligenceData(1004L)).thenReturn(DiligenceDataResponse.builder()
                .permits(List.of(DiligenceDataResponse.PermitRecord.builder()
                        .permitStatus("PENDING").build()))
                .zoning(DiligenceDataResponse.ZoningRecord.builder()
                        .zoningStatus("COMPLIANT").build())
                .build());

        List<UserDashboardResponse.ReviewQueueItem> queue = service.reviewQueue(USER_ID);

        assertThat(queue).hasSize(1);
        assertThat(queue.get(0).flags()).contains(
                "Legal / environmental review needs attention",
                "Building-permit compliance needs verification",
                "Latest building permit is pending approval");
        assertThat(queue.get(0).flags())
                .doesNotContain("Zoning compliance needs verification");
    }

    @Test
    void reviewQueueExcludesCleanProperties() {
        stubHistory(propertyResponse(1001L, "Casagrand Pallagio", "Chennai"));
        when(riskAssessmentRepository.findFirstByPropertyIdOrderByAssessedAtDesc(1001L))
                .thenReturn(Optional.of(RiskAssessmentDetails.builder()
                        .legalRisk(BigDecimal.valueOf(10))
                        .permitCompliance(BigDecimal.valueOf(10))
                        .zoningCompliance(BigDecimal.valueOf(5))
                        .build()));
        lenient().when(diligenceService.getDiligenceData(1001L)).thenReturn(DiligenceDataResponse.builder()
                .permits(List.of(DiligenceDataResponse.PermitRecord.builder()
                        .permitStatus("APPROVED").build()))
                .zoning(DiligenceDataResponse.ZoningRecord.builder()
                        .zoningStatus("COMPLIANT").build())
                .build());

        assertThat(service.reviewQueue(USER_ID)).isEmpty();
    }

    @Test
    void reviewQueueSkipsPropertiesWithoutAssessments() {
        stubHistory(propertyResponse(1002L, "No Data Yet", "Chennai"));
        when(riskAssessmentRepository.findFirstByPropertyIdOrderByAssessedAtDesc(1002L))
                .thenReturn(Optional.empty());

        assertThat(service.reviewQueue(USER_ID)).isEmpty();
    }

    // --- portfolioRisk ---

    @Test
    void portfolioRiskBucketsByEngineTiersAndSurfacesHighRisk() {
        stubHistory(
                propertyResponse(1001L, "Low Risk Property", "Chennai"),
                propertyResponse(1004L, "High Risk Property", "Chennai"),
                propertyResponse(1005L, "Unassessed Property", "Chennai"));
        when(riskAssessmentRepository.findFirstByPropertyIdOrderByAssessedAtDesc(1001L))
                .thenReturn(Optional.of(assessment(7.75)));
        when(riskAssessmentRepository.findFirstByPropertyIdOrderByAssessedAtDesc(1004L))
                .thenReturn(Optional.of(assessment(56.5)));
        when(riskAssessmentRepository.findFirstByPropertyIdOrderByAssessedAtDesc(1005L))
                .thenReturn(Optional.empty());

        UserDashboardResponse.PortfolioRisk risk = service.portfolioRisk(USER_ID);

        assertThat(risk.low()).isEqualTo(1);
        assertThat(risk.high()).isEqualTo(1);
        assertThat(risk.insufficientData()).isEqualTo(1);
        assertThat(risk.totalAssessed()).isEqualTo(3);
        assertThat(risk.highRiskProperties()).hasSize(1);
        assertThat(risk.highRiskProperties().get(0).address()).isEqualTo("High Risk Property");
        assertThat(risk.highRiskProperties().get(0).overallScore())
                .isEqualByComparingTo("56.5");
    }

    @Test
    void portfolioRiskIsEmptyForUserWithoutHistory() {
        when(propertyService.getSearchHistory(USER_ID)).thenReturn(List.of());

        UserDashboardResponse.PortfolioRisk risk = service.portfolioRisk(USER_ID);

        assertThat(risk.totalAssessed()).isZero();
        assertThat(risk.highRiskProperties()).isEmpty();
    }

    // --- fixtures ---

    private void stubHistory(PropertyResponse... properties) {
        when(propertyService.getSearchHistory(USER_ID)).thenReturn(List.of(properties));
    }

    private static RiskAssessmentDetails assessment(double overall) {
        return RiskAssessmentDetails.builder()
                .overallScore(BigDecimal.valueOf(overall))
                .build();
    }

    private static PropertyResponse propertyResponse(Long id, String address, String city) {
        return PropertyResponse.builder()
                .propertyId(id).address(address).city(city)
                .build();
    }

    private static Property property(Long id, String address, String city) {
        Property property = new Property();
        property.setPropertyId(id);
        property.setAddress(address);
        property.setCity(city);
        return property;
    }
}
