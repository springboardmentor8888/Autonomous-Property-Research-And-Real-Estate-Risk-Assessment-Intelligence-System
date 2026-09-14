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
public class ZoningValidationResponseDTO {
    private boolean valid;
    private boolean compliant;
    private String zoneType;
    private String riskLevel;          // LOW, MEDIUM, HIGH
    private List<String> violations;
    private List<String> warnings;
    private String summary;
}
