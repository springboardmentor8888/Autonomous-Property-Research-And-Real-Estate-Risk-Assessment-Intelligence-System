package com.realestate.backend.controller;

import com.realestate.backend.dto.*;
import com.realestate.backend.service.FloodValidationService;
import com.realestate.backend.service.PermitValidationService;
import com.realestate.backend.service.TaxValidationService;
import com.realestate.backend.service.ZoningValidationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class RiskValidationControllerTest {

    private PermitValidationService permitValidationService;
    private TaxValidationService taxValidationService;
    private FloodValidationService floodValidationService;
    private ZoningValidationService zoningValidationService;
    private RiskValidationController controller;

    @BeforeEach
    void setUp() {
        permitValidationService = Mockito.mock(PermitValidationService.class);
        taxValidationService = Mockito.mock(TaxValidationService.class);
        floodValidationService = Mockito.mock(FloodValidationService.class);
        zoningValidationService = Mockito.mock(ZoningValidationService.class);

        controller = new RiskValidationController(
                permitValidationService,
                taxValidationService,
                floodValidationService,
                zoningValidationService
        );
    }

    @Test
    void testValidatePermits() {
        PermitValidationResponseDTO mockResponse = PermitValidationResponseDTO.builder()
                .valid(true)
                .riskLevel("LOW")
                .summary("All permits closed")
                .build();

        when(permitValidationService.validatePermits(any())).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<PermitValidationResponseDTO>> response =
                controller.validatePermits(Collections.emptyList());

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().isSuccess());
        assertEquals("LOW", response.getBody().getData().getRiskLevel());
    }

    @Test
    void testValidateTaxes() {
        TaxValidationResponseDTO mockResponse = TaxValidationResponseDTO.builder()
                .valid(true)
                .riskLevel("LOW")
                .hasDelinquentTaxes(false)
                .build();

        when(taxValidationService.validateTaxHistory(any())).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<TaxValidationResponseDTO>> response =
                controller.validateTaxes(Collections.emptyList());

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().isSuccess());
        assertFalse(response.getBody().getData().isHasDelinquentTaxes());
    }

    @Test
    void testValidateFloodZone() {
        FloodValidationResponseDTO mockResponse = FloodValidationResponseDTO.builder()
                .valid(true)
                .zone("Zone X")
                .riskLevel("LOW")
                .mandatoryFloodInsurance(false)
                .build();

        when(floodValidationService.validateFloodZone(any())).thenReturn(mockResponse);

        FloodZoneDTO request = FloodZoneDTO.builder().zone("Zone X").build();
        ResponseEntity<ApiResponse<FloodValidationResponseDTO>> response =
                controller.validateFloodZone(request);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Zone X", response.getBody().getData().getZone());
    }

    @Test
    void testValidateZoning() {
        ZoningValidationResponseDTO mockResponse = ZoningValidationResponseDTO.builder()
                .valid(true)
                .compliant(true)
                .zoneType("R-1")
                .riskLevel("LOW")
                .build();

        when(zoningValidationService.validateZoning(any(), anyString())).thenReturn(mockResponse);

        ZoningValidationRequestDTO request = ZoningValidationRequestDTO.builder()
                .zoningInfo(ZoningInfoDTO.builder().zoneType("R-1").build())
                .propertyType("Single Family")
                .build();

        ResponseEntity<ApiResponse<ZoningValidationResponseDTO>> response =
                controller.validateZoning(request);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().isSuccess());
        assertTrue(response.getBody().getData().isCompliant());
    }
}
