package com.duedilligenceagent.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * <b>Stage 2 of the diligence workflow</b>: market-trends and comparable-
 * property analysis, computed from the property's stored comparables and
 * market-trend records. Pure analysis — nothing is persisted; the report
 * stage incorporates the {@code summary} when it runs afterwards.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketAnalysisResponse {

    private Long propertyId;
    private LocalDateTime analyzedAt;

    /** Comparable-listings statistics (null when none are stored). */
    private ComparablesSummary comparables;

    /** The property's price position against the comparable market. */
    private Positioning positioning;

    /** The latest stored market-trend record (null when none). */
    private MarketTrendSummary trend;

    /** Professional one-line analysis for the UI and the report summary. */
    private String summary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparablesSummary {
        private Integer count;
        private BigDecimal averagePrice;
        private BigDecimal medianPrice;
        private BigDecimal lowestPrice;
        private BigDecimal highestPrice;
        private BigDecimal averagePricePerSqft;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Positioning {
        /** BELOW_MARKET / ABOVE_MARKET / ALIGNED / UNKNOWN (no price on record). */
        private String verdict;
        private BigDecimal propertyPrice;
        private BigDecimal marketAveragePrice;
        /** (property − market) / market × 100; null when unknown. */
        private BigDecimal deltaPercent;
        private String basis;
        private String note;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketTrendSummary {
        private String locality;
        private String period;
        private BigDecimal avgPricePerSqft;
        private Integer supplyCount;
        private BigDecimal demandPulse;
    }
}
