package com.duedilligenceagent.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
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

    /** Basic property identification for the report header/overview. Computed on read. */
    private PropertyInfo propertyInfo;

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

    /**
     * Property timeline derived from diligence record dates (ownership
     * registered, tax payment, permit issued/completed, zoning effective,
     * flood-zone designation) — newest first. Computed on read.
     */
    private java.util.List<TimelineEvent> timeline;

    /**
     * Due-diligence findings: one entry per sourced diligence area with its
     * status and the key detail behind it. Computed on read.
     */
    private java.util.List<Finding> findings;

    /**
     * Final due-diligence assessment: per-tier verdict headline, major
     * concerns and follow-up actions. Derived from the risk tier, the
     * material concerns and the missing sections — no fabricated advice.
     */
    private Verdict verdict;

    /** Supporting documents uploaded against this property. Computed on read. */
    private java.util.List<DocumentInfo> documents;

    /** Per-domain risk basis: score, level and a one-line basis for each domain. */
    private java.util.List<RiskBasis> riskBasis;

    /** Basic property identification for the report overview. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertyInfo {
        private String propertyType;
        private String locality;
        private String city;
        private java.math.BigDecimal price;
        private String reraId;
    }

    /** One historical event on the property timeline. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineEvent {
        private LocalDate date;
        private String eventType;
        private String description;
        private String source;
    }

    /** One due-diligence finding for a diligence area. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Finding {
        private String area;
        private String status;
        private String detail;
    }

    /** Final due-diligence assessment for the property. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Verdict {
        private String headline;
        private java.util.List<String> majorConcerns;
        private java.util.List<String> followUpActions;
    }

    /** Supporting-document reference information. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentInfo {
        private Long documentId;
        private String fileName;
        private String fileType;
        private LocalDateTime uploadedAt;
    }

    /** Per-domain risk basis row. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskBasis {
        private String domain;
        private java.math.BigDecimal score;
        private String level;
        private String basis;
    }

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
