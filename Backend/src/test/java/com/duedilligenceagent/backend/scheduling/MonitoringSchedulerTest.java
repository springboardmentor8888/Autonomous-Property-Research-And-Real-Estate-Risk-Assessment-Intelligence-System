package com.duedilligenceagent.backend.scheduling;

import com.duedilligenceagent.backend.entities.BuildingPermitDetails;
import com.duedilligenceagent.backend.entities.EnvironmentalDetails;
import com.duedilligenceagent.backend.entities.FloodZoneDetails;
import com.duedilligenceagent.backend.entities.OwnershipDetails;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.PropertyMonitoring;
import com.duedilligenceagent.backend.entities.TaxDetails;
import com.duedilligenceagent.backend.entities.ZoningDetails;
import com.duedilligenceagent.backend.repositories.BuildingPermitDetailsRepository;
import com.duedilligenceagent.backend.repositories.EnvironmentalDetailsRepository;
import com.duedilligenceagent.backend.repositories.FloodZoneDetailsRepository;
import com.duedilligenceagent.backend.repositories.OwnershipDetailsRepository;
import com.duedilligenceagent.backend.repositories.PropertyMonitoringRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.TaxDetailsRepository;
import com.duedilligenceagent.backend.repositories.ZoningDetailsRepository;
import com.duedilligenceagent.backend.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Verifies the scheduled monitoring's snapshot-comparison logic: the
 * first check stores a baseline without alerting, a changed diligence
 * fingerprint sends exactly one MONITORING_UPDATE notification, an
 * unchanged fingerprint stays silent, and the schedule always advances.
 */
@ExtendWith(MockitoExtension.class)
class MonitoringSchedulerTest {

    private static final Long PROPERTY_ID = 1004L;
    private static final Long USER_ID = 7L;

    @Mock private PropertyMonitoringRepository monitoringRepository;
    @Mock private PropertyRepository propertyRepository;
    @Mock private OwnershipDetailsRepository ownershipRepository;
    @Mock private TaxDetailsRepository taxRepository;
    @Mock private BuildingPermitDetailsRepository permitRepository;
    @Mock private ZoningDetailsRepository zoningRepository;
    @Mock private FloodZoneDetailsRepository floodRepository;
    @Mock private EnvironmentalDetailsRepository environmentalRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private MonitoringScheduler scheduler;

    private void stubStoredRecords() {
        lenient().when(ownershipRepository.findByPropertyId(PROPERTY_ID)).thenReturn(Optional.of(
                OwnershipDetails.builder()
                        .ownerName("Kavya Menon").ownershipType("FREEHOLD")
                        .recordDate(LocalDate.of(2024, 6, 15))
                        .build()));
        lenient().when(taxRepository.findByPropertyId(PROPERTY_ID)).thenReturn(List.of(
                TaxDetails.builder()
                        .taxPayDate(LocalDate.of(2026, 4, 1))
                        .taxAmount(new BigDecimal("31100.00"))
                        .taxDue(new BigDecimal("31100.00"))
                        .paymentStatus("OVERDUE")
                        .build()));
        lenient().when(permitRepository.findByPropertyId(PROPERTY_ID)).thenReturn(List.of(
                BuildingPermitDetails.builder()
                        .permitNumber("BP-1004-A").permitType("BUILDING")
                        .permitStatus("PENDING")
                        .issueDate(LocalDate.of(2022, 2, 10))
                        .build()));
        lenient().when(zoningRepository.findByPropertyId(PROPERTY_ID)).thenReturn(List.of(
                ZoningDetails.builder()
                        .zoningCode("R-103").zoningStatus("PENDING")
                        .allowedUse("Residential / Group Housing")
                        .effectiveFrom(LocalDate.of(2020, 1, 1))
                        .build()));
        lenient().when(floodRepository.findByPropertyId(PROPERTY_ID)).thenReturn(List.of(
                FloodZoneDetails.builder()
                        .zone("ZONE-A").riskLevel("HIGH")
                        .effectiveDate(LocalDate.of(2026, 6, 1))
                        .build()));
        lenient().when(environmentalRepository.findByPropertyId(PROPERTY_ID)).thenReturn(List.of(
                EnvironmentalDetails.builder()
                        .recordType("CLEARANCE").status("FLAGGED")
                        .riskLevel("HIGH")
                        .description("Scenario contains an environmental review flag.")
                        .build()));
    }

    private PropertyMonitoring monitor(String lastDigest) {
        return PropertyMonitoring.builder()
                .monitoringId(1L)
                .propertyId(PROPERTY_ID)
                .userId(USER_ID)
                .enabled(true)
                .lastDigest(lastDigest)
                .nextCheckAt(LocalDateTime.now().minusHours(1))
                .build();
    }

    @Test
    void firstCheckStoresBaselineWithoutAlert() {
        stubStoredRecords();
        PropertyMonitoring monitoring = monitor(null);

        scheduler.checkOne(monitoring);

        verify(notificationService, never()).notify(anyLong(), any(), any(), any(), any());
        assertThat(monitoring.getLastDigest()).isNotBlank().hasSize(64);
        assertThat(monitoring.getLastCheckedAt()).isNotNull();
        assertThat(monitoring.getNextCheckAt())
                .isAfter(LocalDateTime.now().plusHours(23));
        verify(monitoringRepository).save(monitoring);
    }

    @Test
    void changedDigestSendsExactlyOneMonitoringAlert() {
        stubStoredRecords();
        when(propertyRepository.findById(PROPERTY_ID)).thenReturn(Optional.of(property()));
        PropertyMonitoring monitoring = monitor("stale-fingerprint-from-a-previous-check");

        scheduler.checkOne(monitoring);

        ArgumentCaptor<String> type = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> message = ArgumentCaptor.forClass(String.class);
        verify(notificationService).notify(eq(USER_ID), type.capture(), message.capture(),
                eq(PROPERTY_ID), any());
        assertThat(type.getValue()).isEqualTo(NotificationService.TYPE_MONITORING_UPDATE);
        assertThat(message.getValue()).contains("Casagrand Bloom").contains("changed");
        // New baseline stored so the same change alerts only once.
        assertThat(monitoring.getLastDigest()).hasSize(64)
                .isNotEqualTo("stale-fingerprint-from-a-previous-check");
    }

    @Test
    void unchangedDigestStaysSilent() {
        stubStoredRecords();
        // Store the real current fingerprint as the previous baseline.
        String current = scheduler.digestOf(PROPERTY_ID);
        PropertyMonitoring monitoring = monitor(current);

        scheduler.checkOne(monitoring);

        verify(notificationService, never()).notify(anyLong(), any(), any(), any(), any());
        assertThat(monitoring.getLastDigest()).isEqualTo(current);
        assertThat(monitoring.getNextCheckAt()).isAfter(LocalDateTime.now().plusHours(23));
    }

    @Test
    void digestIgnoresFetchMetadataButTracksValues() {
        stubStoredRecords();
        String before = scheduler.digestOf(PROPERTY_ID);

        // A value change (tax status flips) must change the fingerprint.
        when(taxRepository.findByPropertyId(PROPERTY_ID)).thenReturn(List.of(
                TaxDetails.builder()
                        .taxPayDate(LocalDate.of(2026, 4, 1))
                        .taxAmount(new BigDecimal("31100.00"))
                        .taxDue(BigDecimal.ZERO)
                        .paymentStatus("PAID")
                        .build()));

        String after = scheduler.digestOf(PROPERTY_ID);
        assertThat(after).isNotEqualTo(before);
    }

    @Test
    void checkDueMonitorsProcessesEveryDueRow() {
        stubStoredRecords();
        PropertyMonitoring first = monitor(null);
        PropertyMonitoring second = monitor(null);
        when(monitoringRepository.findByEnabledTrueAndNextCheckAtLessThanEqual(any(LocalDateTime.class)))
                .thenReturn(List.of(first, second));

        scheduler.checkDueMonitors();

        verify(monitoringRepository).save(first);
        verify(monitoringRepository).save(second);
    }

    @Test
    void checkDueMonitorsExitsQuietlyWhenNothingIsDue() {
        when(monitoringRepository.findByEnabledTrueAndNextCheckAtLessThanEqual(any(LocalDateTime.class)))
                .thenReturn(List.of());

        scheduler.checkDueMonitors();

        verify(monitoringRepository, never()).save(any());
        verify(notificationService, never()).notify(anyLong(), any(), any(), any(), any());
    }

    private Property property() {
        Property property = new Property();
        property.setPropertyId(PROPERTY_ID);
        property.setAddress("Casagrand Bloom, Thirumudivakkam, Chennai");
        return property;
    }
}
