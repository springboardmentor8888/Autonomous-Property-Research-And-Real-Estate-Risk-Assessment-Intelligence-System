package com.duedilligenceagent.backend.dto;

import java.util.List;

/**
 * Admin analytics block (SRS 1.16): risk distribution, search trends, API
 * stats, monitoring counts and a recent activity feed — all computed from
 * live tables, no external calls.
 */
public record AnalyticsResponse(
        RiskDistribution riskDistribution,
        long searchesLast7Days,
        List<TopSearchedAddress> topSearchedAddresses,
        ApiStats apiStats,
        long activeMonitors,
        List<RecentActivity> recentActivity
) {

    /** Latest-assessment-per-property buckets, using the risk engine's tiers. */
    public record RiskDistribution(
            long low,
            long moderate,
            long elevated,
            long high,
            long insufficientData
    ) {}

    public record TopSearchedAddress(
            String address,
            String city,
            long searchCount
    ) {}

    public record ApiStats(
            long totalCalls,
            long successCalls,
            long failedCalls,
            Long avgLatencyMs,
            List<ServiceStat> byService
    ) {}

    public record ServiceStat(
            String serviceName,
            long calls,
            long successCalls,
            Long avgLatencyMs
    ) {}

    public record RecentActivity(
            Long id,
            Long userId,
            String action,
            String entityType,
            Long entityId,
            String createdAt
    ) {}
}
