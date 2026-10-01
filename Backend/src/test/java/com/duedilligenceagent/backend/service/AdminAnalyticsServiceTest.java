package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.AnalyticsResponse;
import com.duedilligenceagent.backend.entities.ActivityLog;
import com.duedilligenceagent.backend.entities.ApiLog;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.repositories.ActivityLogRepository;
import com.duedilligenceagent.backend.repositories.ApiLogRepository;
import com.duedilligenceagent.backend.repositories.PropertyMonitoringRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.RiskAssessmentDetailsRepository;
import com.duedilligenceagent.backend.service.search.PropertySearchService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Verifies the admin analytics computations (SRS 1.16): risk buckets use
 * the risk engine's own tiers on the LATEST assessment per property,
 * search trends resolve to addresses, and API stats aggregate correctly.
 */
@ExtendWith(MockitoExtension.class)
class AdminAnalyticsServiceTest {

    @Mock private RiskAssessmentDetailsRepository riskAssessmentDetailsRepository;
    @Mock private ActivityLogRepository activityLogRepository;
    @Mock private ApiLogRepository apiLogRepository;
    @Mock private PropertyMonitoringRepository propertyMonitoringRepository;
    @Mock private PropertyRepository propertyRepository;

    @InjectMocks private AdminAnalyticsService service;

    private static RiskAssessmentDetails assessment(long propertyId, String score, LocalDateTime at) {
        return RiskAssessmentDetails.builder()
                .propertyId(propertyId)
                .overallScore(score == null ? null : new BigDecimal(score))
                .assessedAt(at)
                .build();
    }

    private static ActivityLog search(long userId, long propertyId, LocalDateTime at) {
        return ActivityLog.builder()
                .userId(userId).action("PROPERTY_SEARCHED")
                .entityType("PROPERTY").entityId(propertyId).createdAt(at).build();
    }

    private static ApiLog apiLog(String service, boolean success, long latencyMs) {
        LocalDateTime requestTime = LocalDateTime.of(2026, 10, 1, 12, 0);
        return ApiLog.builder()
                .serviceName(service)
                .endpoint("GET /api/" + service)
                .requestTime(requestTime)
                .responseTime(requestTime.plusNanos(latencyMs * 1_000_000))
                .success(success)
                .build();
    }

    @Test
    void riskDistributionBucketsLatestAssessmentPerProperty() {
        // Property 1: re-assessed from LOW to HIGH — must count once as HIGH.
        // Property 2: stays MODERATE. Property 3: never assessed -> insufficient.
        when(riskAssessmentDetailsRepository.findAll()).thenReturn(List.of(
                assessment(1L, "10", LocalDateTime.of(2026, 9, 1, 10, 0)),
                assessment(1L, "60", LocalDateTime.of(2026, 9, 20, 10, 0)),
                assessment(2L, "30", LocalDateTime.of(2026, 9, 15, 10, 0))));
        when(propertyRepository.count()).thenReturn(3L);
        when(activityLogRepository.countByActionAndCreatedAtAfter(any(), any())).thenReturn(0L);
        when(activityLogRepository.topEntitiesByAction(any(), any())).thenReturn(List.of());
        when(apiLogRepository.findByRequestTimeAfter(any())).thenReturn(List.of());
        when(propertyMonitoringRepository.countByEnabledTrue()).thenReturn(0L);
        when(activityLogRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        AnalyticsResponse analytics = service.build();

        assertThat(analytics.riskDistribution().low()).isZero();
        assertThat(analytics.riskDistribution().moderate()).isEqualTo(1);
        assertThat(analytics.riskDistribution().elevated()).isZero();
        assertThat(analytics.riskDistribution().high()).isEqualTo(1);
        assertThat(analytics.riskDistribution().insufficientData()).isEqualTo(1);
    }

    @Test
    void searchTrendsCountWindowAndRankTopAddresses() {
        LocalDateTime now = LocalDateTime.now();
        when(riskAssessmentDetailsRepository.findAll()).thenReturn(List.of());
        when(propertyRepository.count()).thenReturn(0L);
        when(activityLogRepository.countByActionAndCreatedAtAfter(
                eq(PropertySearchService.SEARCH_EVENT_ACTION), any())).thenReturn(2L);
        when(activityLogRepository.topEntitiesByAction(
                eq(PropertySearchService.SEARCH_EVENT_ACTION), any(Pageable.class)))
                .thenReturn(List.<Object[]>of(
                        new Object[]{1001L, 3L},
                        new Object[]{1002L, 1L}));
        when(propertyRepository.findAllById(any()))
                .thenReturn(List.of(
                        Property.builder().propertyId(1001L).address("Casagrand Bloom").city("Chennai").build(),
                        Property.builder().propertyId(1002L).address("Bandra Kurla Complex").city("Mumbai").build()));
        when(apiLogRepository.findByRequestTimeAfter(any())).thenReturn(List.of());
        when(propertyMonitoringRepository.countByEnabledTrue()).thenReturn(0L);
        when(activityLogRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        AnalyticsResponse analytics = service.build();

        assertThat(analytics.searchesLast7Days()).isEqualTo(2L);
        assertThat(analytics.topSearchedAddresses()).hasSize(2);
        assertThat(analytics.topSearchedAddresses().get(0).address()).isEqualTo("Casagrand Bloom");
        assertThat(analytics.topSearchedAddresses().get(0).searchCount()).isEqualTo(3);
        assertThat(analytics.topSearchedAddresses().get(1).city()).isEqualTo("Mumbai");
    }

    @Test
    void searchTrendsSkipDeletedProperties() {
        when(riskAssessmentDetailsRepository.findAll()).thenReturn(List.of());
        when(propertyRepository.count()).thenReturn(0L);
        when(activityLogRepository.countByActionAndCreatedAtAfter(any(), any())).thenReturn(0L);
        when(activityLogRepository.topEntitiesByAction(any(), any(Pageable.class)))
                .thenReturn(List.<Object[]>of(new Object[]{9999L, 5L}));
        when(propertyRepository.findAllById(any())).thenReturn(List.of()); // deleted
        when(apiLogRepository.findByRequestTimeAfter(any())).thenReturn(List.of());
        when(propertyMonitoringRepository.countByEnabledTrue()).thenReturn(0L);
        when(activityLogRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        AnalyticsResponse analytics = service.build();

        assertThat(analytics.topSearchedAddresses()).isEmpty();
    }

    @Test
    void apiStatsAggregateSuccessFailureAndLatency() {
        when(riskAssessmentDetailsRepository.findAll()).thenReturn(List.of());
        when(propertyRepository.count()).thenReturn(0L);
        when(activityLogRepository.countByActionAndCreatedAtAfter(any(), any())).thenReturn(0L);
        when(activityLogRepository.topEntitiesByAction(any(), any(Pageable.class))).thenReturn(List.of());
        when(apiLogRepository.findByRequestTimeAfter(any())).thenReturn(List.of(
                apiLog("properties", true, 100),
                apiLog("properties", true, 200),
                apiLog("google", false, 500)));
        when(propertyMonitoringRepository.countByEnabledTrue()).thenReturn(0L);
        when(activityLogRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        AnalyticsResponse analytics = service.build();

        AnalyticsResponse.ApiStats stats = analytics.apiStats();
        assertThat(stats.totalCalls()).isEqualTo(3);
        assertThat(stats.successCalls()).isEqualTo(2);
        assertThat(stats.failedCalls()).isEqualTo(1);
        assertThat(stats.avgLatencyMs()).isEqualTo(267L); // round((100+200+500)/3)

        assertThat(stats.byService()).hasSize(2);
        AnalyticsResponse.ServiceStat properties = stats.byService().get(0);
        assertThat(properties.serviceName()).isEqualTo("properties"); // sorted by calls desc
        assertThat(properties.calls()).isEqualTo(2);
        assertThat(properties.successCalls()).isEqualTo(2);
        assertThat(properties.avgLatencyMs()).isEqualTo(150L);
    }

    @Test
    void apiStatsHandleMissingResponseTimes() {
        when(riskAssessmentDetailsRepository.findAll()).thenReturn(List.of());
        when(propertyRepository.count()).thenReturn(0L);
        when(activityLogRepository.countByActionAndCreatedAtAfter(any(), any())).thenReturn(0L);
        when(activityLogRepository.topEntitiesByAction(any(), any(Pageable.class))).thenReturn(List.of());
        ApiLog noResponse = ApiLog.builder()
                .serviceName("properties").endpoint("GET /api/properties")
                .requestTime(LocalDateTime.now()).responseTime(null).success(true).build();
        when(apiLogRepository.findByRequestTimeAfter(any())).thenReturn(List.of(noResponse));
        when(propertyMonitoringRepository.countByEnabledTrue()).thenReturn(0L);
        when(activityLogRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        AnalyticsResponse analytics = service.build();

        assertThat(analytics.apiStats().totalCalls()).isEqualTo(1);
        assertThat(analytics.apiStats().avgLatencyMs()).isNull();
    }

    @Test
    void monitoringCountAndRecentActivityFeed() {
        when(riskAssessmentDetailsRepository.findAll()).thenReturn(List.of());
        when(propertyRepository.count()).thenReturn(0L);
        when(activityLogRepository.countByActionAndCreatedAtAfter(any(), any())).thenReturn(0L);
        when(activityLogRepository.topEntitiesByAction(any(), any(Pageable.class))).thenReturn(List.of());
        when(apiLogRepository.findByRequestTimeAfter(any())).thenReturn(List.of());
        when(propertyMonitoringRepository.countByEnabledTrue()).thenReturn(4L);
        ActivityLog recent = search(7L, 1004L, LocalDateTime.now());
        when(activityLogRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(recent)));

        AnalyticsResponse analytics = service.build();

        assertThat(analytics.activeMonitors()).isEqualTo(4);
        assertThat(analytics.recentActivity()).hasSize(1);
        assertThat(analytics.recentActivity().get(0).action()).isEqualTo("PROPERTY_SEARCHED");
        assertThat(analytics.recentActivity().get(0).entityId()).isEqualTo(1004L);
    }
}
