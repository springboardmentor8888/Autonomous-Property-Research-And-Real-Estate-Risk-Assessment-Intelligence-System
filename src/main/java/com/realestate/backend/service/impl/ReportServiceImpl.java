package com.realestate.backend.service.impl;

import com.realestate.backend.dto.PropertyResponseDTO;
import com.realestate.backend.dto.ReportResponseDTO;
import com.realestate.backend.dto.RiskAssessmentResponseDTO;
import com.realestate.backend.entity.Property;
import com.realestate.backend.exception.ResourceNotFoundException;
import com.realestate.backend.repository.PropertyRepository;
import com.realestate.backend.service.PropertyService;
import com.realestate.backend.service.ReportService;
import com.realestate.backend.service.RiskEngineService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

private final PropertyRepository propertyRepository;
private final PropertyService propertyService;
private final RiskEngineService riskEngineService;

public ReportServiceImpl(
        PropertyRepository propertyRepository,
        PropertyService propertyService,
        RiskEngineService riskEngineService) {

    this.propertyRepository = propertyRepository;
    this.propertyService = propertyService;
    this.riskEngineService = riskEngineService;
}

@Override
public ReportResponseDTO generateReport(Long propertyId) {

    Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Property not found with ID: " + propertyId
                    )
            );

    PropertyResponseDTO propertyDetails =
            propertyService.getPropertyById(propertyId);

    RiskAssessmentResponseDTO riskAssessment =
            riskEngineService.assessRisk(propertyId);

    List<PropertyResponseDTO> comparableProperties =
            propertyService.getComparableProperties(propertyId);

    return new ReportResponseDTO(
            property.getId(),
            propertyDetails,
            riskAssessment,
            comparableProperties
    );
}

}