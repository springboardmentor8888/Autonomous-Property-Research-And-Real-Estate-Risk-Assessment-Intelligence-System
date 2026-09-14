package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloodValidationResponseDTO {
    private boolean valid;
    private String zone;
    private String riskLevel;          // LOW, MEDIUM, HIGH
    private boolean mandatoryFloodInsurance;
    private List<String> warnings;
    private String advisoryNotice;
}
