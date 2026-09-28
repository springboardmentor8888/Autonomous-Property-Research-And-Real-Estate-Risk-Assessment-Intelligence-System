package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponseDTO {

private Long propertyId;

private PropertyResponseDTO propertyDetails;

private RiskAssessmentResponseDTO riskAssessment;

private List<PropertyResponseDTO> comparableProperties;

}