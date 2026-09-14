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
public class ZoningInfoDTO {
    private String zoneType;          // e.g., R-1 (Single Family Residential), C-2 (Commercial), M-1 (Industrial)
    private Boolean compliant;
    private String jurisdiction;
    private List<String> permittedUses;
    private Double maxBuildingHeightFeet;
    private String description;
}
