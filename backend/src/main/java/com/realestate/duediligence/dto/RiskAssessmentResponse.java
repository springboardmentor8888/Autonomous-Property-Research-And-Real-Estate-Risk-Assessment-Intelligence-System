package com.realestate.duediligence.dto;

import com.realestate.duediligence.entity.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Represents the calculated risk assessment for a property, combining
 * tax, flood, zoning, permit, and environmental factors into a single
 * score and overall risk level.
 */
@Data
@AllArgsConstructor
public class RiskAssessmentResponse {

    private Long propertyId;
    private int riskScore;
    private RiskLevel overallRiskLevel;
    private String taxRiskNote;
    private String floodRiskNote;
    private String zoningRiskNote;
    private String permitRiskNote;
    private String environmentalRiskNote;
}