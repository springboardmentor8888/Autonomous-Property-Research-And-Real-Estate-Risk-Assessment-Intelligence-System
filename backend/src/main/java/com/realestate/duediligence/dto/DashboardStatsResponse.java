package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

/**
 * Aggregate platform statistics for the admin dashboard, per our
 * SRS's "administrative dashboards and analytics" requirement.
 */
@Data
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalUsers;
    private long totalProperties;
    private long totalReportsGenerated;
    private Map<String, Long> riskLevelDistribution;
    private long totalAuditEvents;
}