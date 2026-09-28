package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentResponseDTO {

    private Long propertyId;

    private String overallRiskLevel;

    private String status;

    private String message;
}