package com.realestate.backend.service;

import com.realestate.backend.dto.TaxHistoryDTO;
import com.realestate.backend.dto.TaxValidationResponseDTO;

import java.util.List;

public interface TaxValidationService {

    /**
     * Analyzes historical property tax assessments and payment records.
     * Identifies overdue/delinquent taxes, tax liens, and calculates tax risk level.
     *
     * @param taxHistory List of yearly tax records
     * @return Tax validation result with unpaid amounts and risk alerts
     */
    TaxValidationResponseDTO validateTaxHistory(List<TaxHistoryDTO> taxHistory);
}
