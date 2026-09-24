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
 * <p>
 * All scores are 0–100 <b>risk</b> scores — higher means riskier — matching
 * the seeded demonstration dataset (e.g. a fully compliant property scores
 * ~7.75 overall, an overdue-tax/high-flood property ~52.5). Null until the
 * diligence pipeline has produced an assessment.
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
