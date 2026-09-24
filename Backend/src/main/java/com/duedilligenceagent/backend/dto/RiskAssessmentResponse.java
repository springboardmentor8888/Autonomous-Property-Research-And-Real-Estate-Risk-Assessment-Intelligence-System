package com.duedilligenceagent.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Latest risk assessment for a property, as returned by
 * {@code GET /api/properties/{id}/risk-assessment}.
 * Scores are 0-10 (higher = safer); null until the diligence pipeline
 * has produced an assessment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentResponse {

    private Long riskAssessmentId;
    private Long propertyId;
    private BigDecimal taxRisk;
    private BigDecimal legalRisk;
    private BigDecimal floodRisk;
    private BigDecimal permitCompliance;
    private BigDecimal zoningCompliance;
    private BigDecimal ownershipVerification;
    private BigDecimal overallScore;
    private LocalDateTime assessedAt;
}
