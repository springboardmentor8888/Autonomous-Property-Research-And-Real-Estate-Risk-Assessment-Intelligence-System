package com.duedilligenceagent.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * A generated due-diligence report, as returned by
 * {@code POST/GET /api/properties/{id}/report} and listed by
 * {@code GET /api/reports/mine}. User-facing only — no provider names,
 * no contract statuses, no pipeline internals.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    private Long reportId;
    private Long propertyId;
    private String propertyAddress;
    private String riskTier;
    private String executiveSummary;
    private String status;
    private LocalDateTime generatedAt;

    /** The stored-data aggregation run that fed this report. */
    private Long aggregationRunId;
    private String aggregationStatus;

    /** The calculated risk assessment linked to this report (0-100, higher = riskier). */
    private RiskAssessmentResponse risk;

    /** The diligence record statuses that informed the assessment. */
    private RecordStatuses records;

    /** What data was available for this report. */
    private DataCoverage coverage;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecordStatuses {
        private String taxStatus;
        private String permitStatus;
        private String zoningStatus;
        private String floodRiskLevel;
        private String environmentalStatus;
        private String ownershipType;
        private Integer utilitiesAvailable;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataCoverage {
        private boolean ownershipRecord;
        private boolean taxRecord;
        private boolean permitRecord;
        private boolean zoningRecord;
        private boolean floodRecord;
        private boolean environmentalRecord;
        private boolean utilityRecords;
        private Integer comparablesCount;
        private Integer marketTrendsCount;
        private List<String> missingSections;
    }
}
