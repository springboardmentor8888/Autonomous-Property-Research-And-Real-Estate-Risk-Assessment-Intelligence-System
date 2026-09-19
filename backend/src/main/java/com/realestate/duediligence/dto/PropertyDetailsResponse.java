package com.realestate.duediligence.dto;

import com.realestate.duediligence.entity.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * Aggregated response combining a property's core details with its
 * ownership, tax, zoning, flood zone, permit, environmental, and
 * utility records — matching our API contract and the full SRS
 * Due Diligence module list.
 */
@Data
@AllArgsConstructor
public class PropertyDetailsResponse {

    private Long id;
    private String address;
    private OwnershipRecord ownership;
    private List<TaxHistory> taxHistory;
    private ZoningInfo zoning;
    private FloodZoneInfo floodZone;
    private List<PermitRecord> permits;
    private EnvironmentalRecord environmental;
    private UtilityInfo utility;
}