package com.realestate.backend.service;

import com.realestate.backend.dto.PermitRecordDTO;
import com.realestate.backend.dto.PermitValidationResponseDTO;
import com.realestate.backend.service.impl.PermitValidationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PermitValidationServiceTest {

    private PermitValidationService permitValidationService;

    @BeforeEach
    void setUp() {
        permitValidationService = new PermitValidationServiceImpl();
    }

    @Test
    void testAllClosedPermits_ReturnsLowRisk() {
        List<PermitRecordDTO> permits = List.of(
                PermitRecordDTO.builder()
                        .permitNumber("BLD-2022-001")
                        .permitType("BUILDING")
                        .status("CLOSED")
                        .issuedDate(LocalDate.now().minusYears(2))
                        .description("Backyard patio addition")
                        .build()
        );

        PermitValidationResponseDTO response = permitValidationService.validatePermits(permits);

        assertNotNull(response);
        assertTrue(response.isValid());
        assertEquals("LOW", response.getRiskLevel());
        assertEquals(0, response.getOpenPermitsCount());
        assertEquals(0, response.getExpiredPermitsCount());
    }

    @Test
    void testOpenPermit_ReturnsMediumRiskWithWarning() {
        List<PermitRecordDTO> permits = List.of(
                PermitRecordDTO.builder()
                        .permitNumber("ELEC-2024-55")
                        .permitType("ELECTRICAL")
                        .status("OPEN")
                        .issuedDate(LocalDate.now().minusMonths(3))
                        .description("200 Amp panel upgrade")
                        .build()
        );

        PermitValidationResponseDTO response = permitValidationService.validatePermits(permits);

        assertNotNull(response);
        assertTrue(response.isValid());
        assertEquals("MEDIUM", response.getRiskLevel());
        assertEquals(1, response.getOpenPermitsCount());
        assertFalse(response.getWarnings().isEmpty());
    }

    @Test
    void testViolationPermit_ReturnsHighRiskAndInvalid() {
        List<PermitRecordDTO> permits = List.of(
                PermitRecordDTO.builder()
                        .permitNumber("PLM-2023-99")
                        .permitType("PLUMBING")
                        .status("VIOLATION")
                        .description("Unpermitted sewage connection")
                        .build()
        );

        PermitValidationResponseDTO response = permitValidationService.validatePermits(permits);

        assertNotNull(response);
        assertFalse(response.isValid());
        assertEquals("HIGH", response.getRiskLevel());
        assertEquals(1, response.getViolationsCount());
    }
}
