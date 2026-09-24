package com.duedilligenceagent.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * The full due-diligence record set stored for a property, as returned by
 * {@code GET /api/properties/{id}/diligence}. Sections absent from the
 * dataset are null — the frontend only renders what exists.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiligenceDataResponse {

    private Long propertyId;
    private OwnershipRecord ownership;
    private TaxRecord tax;
    private List<PermitRecord> permits;
    private ZoningRecord zoning;
    private FloodRecord flood;
    private EnvironmentalRecord environmental;
    private List<UtilityRecord> utilities;
    private List<ComparableRecord> comparables;
    private List<MarketTrendRecord> marketTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnershipRecord {
        private String ownerName;
        private String ownershipType;
        private LocalDate recordDate;
        private String source;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaxRecord {
        private LocalDate taxPayDate;
        private BigDecimal taxAmount;
        private BigDecimal taxDue;
        private String paymentStatus;
        private String source;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PermitRecord {
        private String permitNumber;
        private String permitType;
        private String permitStatus;
        private LocalDate issueDate;
        private LocalDate completionDate;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ZoningRecord {
        private String zoningCode;
        private String zoningStatus;
        private String allowedUse;
        private LocalDate effectiveFrom;
        private LocalDate effectiveTo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FloodRecord {
        private String zone;
        private String riskLevel;
        private LocalDate effectiveDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnvironmentalRecord {
        private String recordType;
        private String status;
        private String riskLevel;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilityRecord {
        private String utilityType;
        private String provider;
        private String availabilityStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparableRecord {
        private String listingId;
        private String locality;
        private String propertyType;
        private String bhk;
        private Integer areaSqft;
        private BigDecimal price;
        private BigDecimal pricePerSqft;
        private String reraId;
        private Boolean verified;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketTrendRecord {
        private String locality;
        private String period;
        private BigDecimal avgPricePerSqft;
        private Integer supplyCount;
        private BigDecimal demandPulse;
    }
}
