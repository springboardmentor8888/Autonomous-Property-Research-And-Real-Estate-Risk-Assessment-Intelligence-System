package com.realestate.backend.service.impl;

import com.realestate.backend.dto.TaxHistoryDTO;
import com.realestate.backend.dto.TaxValidationResponseDTO;
import com.realestate.backend.service.TaxValidationService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class TaxValidationServiceImpl implements TaxValidationService {

    @Override
    public TaxValidationResponseDTO validateTaxHistory(List<TaxHistoryDTO> taxHistory) {
        if (taxHistory == null || taxHistory.isEmpty()) {
            return TaxValidationResponseDTO.builder()
                    .valid(true)
                    .hasDelinquentTaxes(false)
                    .totalUnpaidAmount(BigDecimal.ZERO)
                    .riskLevel("LOW")
                    .delinquentYears(List.of())
                    .warnings(List.of("No historical tax records provided for this property."))
                    .summary("No municipal tax records on file.")
                    .build();
        }

        BigDecimal unpaidTotal = BigDecimal.ZERO;
        List<String> delinquentYears = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        for (TaxHistoryDTO record : taxHistory) {
            String status = record.getStatus() != null ? record.getStatus().toUpperCase().trim() : "PAID";
            Integer year = record.getYear();

            if ("DELINQUENT".equals(status) || "UNPAID".equals(status)) {
                delinquentYears.add(year != null ? year.toString() : "Unknown Year");
                BigDecimal owed = BigDecimal.ZERO;
                if (record.getAmountAssessed() != null && record.getAmountPaid() != null) {
                    owed = record.getAmountAssessed().subtract(record.getAmountPaid());
                } else if (record.getAmountAssessed() != null) {
                    owed = record.getAmountAssessed();
                }
                if (owed.compareTo(BigDecimal.ZERO) > 0) {
                    unpaidTotal = unpaidTotal.add(owed);
                }
                warnings.add("Delinquent property tax detected for tax year " + year + " (Owed: $" + owed + "). Tax lien risk!");
            } else if ("PARTIAL".equals(status) && record.getAmountAssessed() != null && record.getAmountPaid() != null) {
                BigDecimal remaining = record.getAmountAssessed().subtract(record.getAmountPaid());
                if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                    unpaidTotal = unpaidTotal.add(remaining);
                    warnings.add("Partial tax payment recorded for year " + year + ". Remaining balance: $" + remaining);
                }
            }
        }

        boolean hasDelinquent = !delinquentYears.isEmpty();
        String riskLevel;
        boolean isValid;

        if (unpaidTotal.compareTo(BigDecimal.valueOf(5000)) > 0 || delinquentYears.size() >= 2) {
            riskLevel = "HIGH";
            isValid = false;
        } else if (hasDelinquent || unpaidTotal.compareTo(BigDecimal.ZERO) > 0) {
            riskLevel = "MEDIUM";
            isValid = false;
        } else {
            riskLevel = "LOW";
            isValid = true;
        }

        String summary = String.format(
                "Tax History Evaluated: %d records examined. Delinquent status: %s. Total unpaid taxes: $%s. Overall Risk: %s.",
                taxHistory.size(), hasDelinquent ? "YES" : "NO", unpaidTotal, riskLevel
        );

        return TaxValidationResponseDTO.builder()
                .valid(isValid)
                .hasDelinquentTaxes(hasDelinquent)
                .totalUnpaidAmount(unpaidTotal)
                .riskLevel(riskLevel)
                .delinquentYears(delinquentYears)
                .warnings(warnings)
                .summary(summary)
                .build();
    }
}
