package com.realestate.duediligence.dto;

import lombok.*;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessmentDto {
    private Long propertyId;
    private Integer riskScore;
    private String riskLevel; // LOW, MEDIUM, HIGH
    private Map<String, String> factors;
}
