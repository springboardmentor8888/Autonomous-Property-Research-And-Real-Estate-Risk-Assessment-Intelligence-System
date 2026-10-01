package com.duedilligenceagent.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardResponse {

    private long totalUsers;
    private long totalProperties;
    private long totalAdmins;

    /** Analytics block (SRS 1.16): risk distribution, trends, API stats. */
    private AnalyticsResponse analytics;
}
