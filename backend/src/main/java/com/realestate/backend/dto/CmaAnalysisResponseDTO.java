package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CmaAnalysisResponseDTO {
    private PropertyResponseDTO subjectProperty;
    private List<ComparablePropertyDTO> comparableProperties;
    private BigDecimal subjectPricePerSqFt;
    private BigDecimal averagePricePerSqFt;
    private BigDecimal estimatedFairMarketValue;
    private Double priceVariancePercentage;
    private String marketTrend;             // BULLISH, STABLE, CONSOLIDATING
    private String valuationAssessment;     // UNDERVALUED, FAIR_VALUE, OVERVALUED
    private Double confidenceScore;         // e.g., 94.5%
    private String summary;
}
