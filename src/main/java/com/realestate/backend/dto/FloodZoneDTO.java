package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloodZoneDTO {
    private String zone;              // e.g., Zone X, Zone AE, Zone VE, Zone A
    private String riskLevel;         // MINIMAL, MODERATE, HIGH
    private Boolean insuranceRequired;
    private String description;
    private String fhashMapId;
}
