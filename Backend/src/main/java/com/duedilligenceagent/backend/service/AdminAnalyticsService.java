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
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin analytics (SRS 1.16): computes the dashboard analytics block from
 * live tables — risk distribution, search trends, API stats, monitoring
 * counts and a recent activity feed. Read-only; no external calls.
 */
@Service
public class AdminAnalyticsService {

    private static final String SEARCH_ACTION = PropertySearchService.SEARCH_EVENT_ACTION;
    private static final int ANALYTICS_WINDOW_DAYS = 7;
    private static final int TOP_ADDRESSES_LIMIT = 5;
    private static final int RECENT_ACTIVITY_LIMIT = 10;

    private final RiskAssessmentDetailsRepository riskAssessmentDetailsRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ApiLogRepository apiLogRepository;
    private final PropertyMonitoringRepository propertyMonitoringRepository;
    private final PropertyRepository propertyRepository;

    public AdminAnalyticsService(
            RiskAssessmentDetailsRepository riskAssessmentDetailsRepository,
            ActivityLogRepository activityLogRepository,
            ApiLogRepository apiLogRepository,
            PropertyMonitoringRepository propertyMonitoringRepository,
            PropertyRepository propertyRepository) {

        this.riskAssessmentDetailsRepository = riskAssessmentDetailsRepository;
        this.activityLogRepository = activityLogRepository;
        this.apiLogRepository = apiLogRepository;
        this.propertyMonitoringRepository = propertyMonitoringRepository;
        this.propertyRepository = propertyRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse build() {
        LocalDateTime since = LocalDateTime.now().minusDays(ANALYTICS_WINDOW_DAYS);
        return new AnalyticsResponse(
                riskDistribution(),
                activityLogRepository.countByActionAndCreatedAtAfter(SEARCH_ACTION, since),
                topSearchedAddresses(),
                apiStats(since),
                propertyMonitoringRepository.countByEnabledTrue(),
                recentActivity()
        );
    }

    /**
     * Buckets the LATEST assessment per property using the risk engine's own
     * tiers, so a re-assessed property counts once at its current tier.
     * Properties never assessed count as INSUFFICIENT_DATA.
     */
    private AnalyticsResponse.RiskDistribution riskDistribution() {
        Map<Long, RiskAssessmentDetails> latestByProperty = new HashMap<>();
        for (RiskAssessmentDetails assessment : riskAssessmentDetailsRepository.findAll()) {
            latestByProperty.merge(assessment.getPropertyId(), assessment, (older, newer) ->
                    isNewer(newer, older) ? newer : older);
        }

        long low = 0;
        long moderate = 0;
        long elevated = 0;
        long high = 0;
        for (RiskAssessmentDetails assessment : latestByProperty.values()) {
            switch (RiskAssessmentService.tierOf(assessment.getOverallScore())) {
                case "LOW" -> low++;
                case "MODERATE" -> moderate++;
                case "ELEVATED" -> elevated++;
                case "HIGH" -> high++;
                default -> { /* INSUFFICIENT_DATA rows carry no score */ }
            }
        }

        long insufficientData = Math.max(
                0, propertyRepository.count() - latestByProperty.size());
        return new AnalyticsResponse.RiskDistribution(low, moderate, elevated, high, insufficientData);
    }

    private boolean isNewer(RiskAssessmentDetails candidate, RiskAssessmentDetails current) {
        if (candidate.getAssessedAt() == null) {
            return false;
        }
        return current.getAssessedAt() == null
                || candidate.getAssessedAt().isAfter(current.getAssessedAt());
    }

    /** Most-searched properties, resolved to address + city for display. */
    private List<AnalyticsResponse.TopSearchedAddress> topSearchedAddresses() {
        List<Object[]> rows = activityLogRepository.topEntitiesByAction(
                SEARCH_ACTION, PageRequest.of(0, TOP_ADDRESSES_LIMIT));

        List<Long> propertyIds = rows.stream()
                .map(row -> (Long) row[0])
                .toList();
        Map<Long, Property> properties = propertyRepository.findAllById(propertyIds).stream()
                .collect(HashMap::new, (map, property) -> map.put(property.getPropertyId(), property), HashMap::putAll);

        List<AnalyticsResponse.TopSearchedAddress> result = new ArrayList<>();
        for (Object[] row : rows) {
            Property property = properties.get((Long) row[0]);
            if (property == null) {
                continue; // property deleted since the search
            }
            result.add(new AnalyticsResponse.TopSearchedAddress(
                    property.getAddress(),
                    property.getCity(),
                    (Long) row[1]));
        }
        return result;
    }

    /** API call stats over the analytics window, computed from logged calls. */
    private AnalyticsResponse.ApiStats apiStats(LocalDateTime since) {
        List<ApiLog> logs = apiLogRepository.findByRequestTimeAfter(since);

        long successCalls = logs.stream().filter(log -> Boolean.TRUE.equals(log.getSuccess())).count();
        Long avgLatencyMs = avgLatency(logs);

        Map<String, List<ApiLog>> byService = new HashMap<>();
        for (ApiLog log : logs) {
            byService.computeIfAbsent(log.getServiceName(), service -> new ArrayList<>()).add(log);
        }

        List<AnalyticsResponse.ServiceStat> services = byService.entrySet().stream()
                .map(entry -> new AnalyticsResponse.ServiceStat(
                        entry.getKey(),
                        entry.getValue().size(),
                        entry.getValue().stream().filter(log -> Boolean.TRUE.equals(log.getSuccess())).count(),
                        avgLatency(entry.getValue())))
                .sorted((a, b) -> Long.compare(b.calls(), a.calls()))
                .toList();

        return new AnalyticsResponse.ApiStats(
                logs.size(), successCalls, logs.size() - successCalls, avgLatencyMs, services);
    }

    private Long avgLatency(List<ApiLog> logs) {
        return logs.stream()
                .filter(log -> log.getResponseTime() != null)
                .mapToLong(log -> Duration.between(log.getRequestTime(), log.getResponseTime()).toMillis())
                .average()
                .stream()
                .boxed()
                .findFirst()
                .map(Math::round)
                .orElse(null);
    }

    private List<AnalyticsResponse.RecentActivity> recentActivity() {
        return activityLogRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, RECENT_ACTIVITY_LIMIT))
                .getContent()
                .stream()
                .map(log -> new AnalyticsResponse.RecentActivity(
                        log.getActivityLogId(),
                        log.getUserId(),
                        log.getAction(),
                        log.getEntityType(),
                        log.getEntityId(),
                        log.getCreatedAt().toString()))
                .toList();
    }
}
