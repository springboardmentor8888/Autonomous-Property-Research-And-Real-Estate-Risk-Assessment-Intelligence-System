package com.realestate.backend.service;

import com.realestate.backend.dto.FloodValidationResponseDTO;
import com.realestate.backend.dto.FloodZoneDTO;

public interface FloodValidationService {

    /**
     * Validates flood zone categorization according to FEMA flood plain mapping.
     * Evaluates flood hazard tiers (Zone X vs Zone AE/VE) and insurance mandates.
     *
     * @param floodZone Data representing FEMA flood hazard designation
     * @return Risk scoring and mandatory insurance status
     */
    FloodValidationResponseDTO validateFloodZone(FloodZoneDTO floodZone);
}
