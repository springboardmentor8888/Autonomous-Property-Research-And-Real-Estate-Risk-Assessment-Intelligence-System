package com.realestate.backend.service;

import com.realestate.backend.dto.CmaAnalysisResponseDTO;

public interface CmaService {

    /**
     * Performs Comparable Property Analysis (CMA) on a registered property.
     * Evaluates comps within the submarket/city and computes valuation variance.
     *
     * @param propertyId ID of the subject property
     * @return Full CMA metrics, comps list, and market trend assessment
     */
    CmaAnalysisResponseDTO analyzeProperty(Long propertyId);
}
