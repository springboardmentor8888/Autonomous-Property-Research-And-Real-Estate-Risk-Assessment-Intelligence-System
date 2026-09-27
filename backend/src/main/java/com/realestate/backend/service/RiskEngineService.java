package com.realestate.backend.service;

import com.realestate.backend.dto.RiskAssessmentResponseDTO;

public interface RiskEngineService {

    RiskAssessmentResponseDTO assessRisk(Long propertyId);
}