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

    /**
     * Point-wise rendering of the executive summary for on-screen review —
     * headline risk profile, one bullet per material concern, ownership,
     * market positioning and data coverage. Computed on read so previously
     * generated reports also get bullets; the stored paragraph remains the
     * source for PDF/Excel/email.
     */
    private java.util.List<String> summaryPoints;

    private String status;
    private LocalDateTime generatedAt;

    /** The stored-data aggregation run that fed this report. */
    private Long aggregationRunId;
    private String aggregationStatus;

    /** Stage-2 output: the property's market positioning (null when no comparables). */
    private MarketPosition marketPosition;

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
    public static class MarketPosition {
        /** BELOW_MARKET / ABOVE_MARKET / ALIGNED / UNKNOWN / NO_COMPARABLES. */
        private String verdict;
        /** (property − market) / market × 100; null when unknown. */
        private java.math.BigDecimal deltaPercent;
        /** "total price" or "price per sqft". */
        private String basis;
    }

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
