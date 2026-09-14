package com.realestate.backend.service;

import com.realestate.backend.dto.PermitRecordDTO;
import com.realestate.backend.dto.PermitValidationResponseDTO;

import java.util.List;

public interface PermitValidationService {

    /**
     * Validates a list of building/renovation permits for a property.
     * Identifies open permits, unclosed work, expired permits, and risk factors.
     *
     * @param permits List of permit records associated with the property
     * @return Detailed permit validation analysis and risk assessment
     */
    PermitValidationResponseDTO validatePermits(List<PermitRecordDTO> permits);
}
