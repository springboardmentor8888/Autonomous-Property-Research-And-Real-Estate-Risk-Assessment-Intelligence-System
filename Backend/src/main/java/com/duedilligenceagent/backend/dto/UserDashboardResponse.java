package com.duedilligenceagent.backend.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Role-dashboard aggregations (SRS RBAC): every payload is scoped to the
 * calling user's own properties — the dashboards choose which to render
 * per role, the endpoints never expose another user's data.
 */
public class UserDashboardResponse {

    /** One monitored property on the caller's change-watch list. */
    @Builder
    public record MonitoredProperty(
            Long propertyId,
            String address,
            String city,
            LocalDateTime monitoredSince,
            LocalDateTime lastCheckedAt
    ) {}

    /** One property needing the legal reviewer's attention. */
    @Builder
    public record ReviewQueueItem(
            Long propertyId,
            String address,
            String city,
            BigDecimal legalEnvironmentalRisk,
            BigDecimal permitCompliance,
            BigDecimal zoningCompliance,
            List<String> flags
    ) {}

    /** Risk-tier distribution over the caller's own portfolio. */
    @Builder
    public record PortfolioRisk(
            long low,
            long moderate,
            long elevated,
            long high,
            long insufficientData,
            long totalAssessed,
            List<HighRiskProperty> highRiskProperties
    ) {}

    /** A HIGH-tier property surfaced from the portfolio distribution. */
    @Builder
    public record HighRiskProperty(
            Long propertyId,
            String address,
            BigDecimal overallScore
    ) {}
}
