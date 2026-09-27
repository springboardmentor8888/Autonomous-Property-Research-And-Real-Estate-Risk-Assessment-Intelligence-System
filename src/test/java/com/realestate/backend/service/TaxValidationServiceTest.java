package com.realestate.backend.service;

import com.realestate.backend.dto.TaxHistoryDTO;
import com.realestate.backend.dto.TaxValidationResponseDTO;
import com.realestate.backend.service.impl.TaxValidationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TaxValidationServiceTest {

    private TaxValidationService taxValidationService;

    @BeforeEach
    void setUp() {
        taxValidationService = new TaxValidationServiceImpl();
    }

    @Test
    void testPaidTaxes_ReturnsLowRisk() {
        List<TaxHistoryDTO> history = List.of(
                TaxHistoryDTO.builder()
                        .year(2023)
                        .amountAssessed(new BigDecimal("4500.00"))
                        .amountPaid(new BigDecimal("4500.00"))
                        .status("PAID")
                        .build(),
                TaxHistoryDTO.builder()
                        .year(2024)
                        .amountAssessed(new BigDecimal("4700.00"))
                        .amountPaid(new BigDecimal("4700.00"))
                        .status("PAID")
                        .build()
        );

        TaxValidationResponseDTO response = taxValidationService.validateTaxHistory(history);

        assertNotNull(response);
        assertTrue(response.isValid());
        assertFalse(response.isHasDelinquentTaxes());
        assertEquals("LOW", response.getRiskLevel());
        assertEquals(BigDecimal.ZERO, response.getTotalUnpaidAmount());
    }

    @Test
    void testDelinquentTax_ReturnsHighRiskAndLienWarning() {
        List<TaxHistoryDTO> history = List.of(
                TaxHistoryDTO.builder()
                        .year(2023)
                        .amountAssessed(new BigDecimal("6000.00"))
                        .amountPaid(new BigDecimal("0.00"))
                        .status("DELINQUENT")
                        .build()
        );

        TaxValidationResponseDTO response = taxValidationService.validateTaxHistory(history);

        assertNotNull(response);
        assertFalse(response.isValid());
        assertTrue(response.isHasDelinquentTaxes());
        assertEquals("HIGH", response.getRiskLevel());
        assertEquals(new BigDecimal("6000.00"), response.getTotalUnpaidAmount());
        assertFalse(response.getWarnings().isEmpty());
    }
}
