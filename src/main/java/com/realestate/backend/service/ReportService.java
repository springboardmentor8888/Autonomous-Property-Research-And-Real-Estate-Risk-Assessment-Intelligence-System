package com.realestate.backend.service;

import com.realestate.backend.dto.ReportResponseDTO;

public interface ReportService {

ReportResponseDTO generateReport(Long propertyId);

}