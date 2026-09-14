package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxValidationResponseDTO {
    private boolean valid;
    private boolean hasDelinquentTaxes;
    private BigDecimal totalUnpaidAmount;
    private String riskLevel;          // LOW, MEDIUM, HIGH
    private List<String> delinquentYears;
    private List<String> warnings;
    private String summary;
}
