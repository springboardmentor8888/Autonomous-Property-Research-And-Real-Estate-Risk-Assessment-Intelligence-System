package com.realestate.backend.service;

import com.realestate.backend.dto.ZoningInfoDTO;
import com.realestate.backend.dto.ZoningValidationResponseDTO;

public interface ZoningValidationService {

    /**
     * Validates property zoning compliance against municipal land use regulations.
     *
     * @param zoningInfo Zoning information retrieved from municipal records
     * @param propertyType Intended or current property usage (e.g., SINGLE_FAMILY, COMMERCIAL)
     * @return Compliance assessment and violation alerts
     */
    ZoningValidationResponseDTO validateZoning(ZoningInfoDTO zoningInfo, String propertyType);
}
