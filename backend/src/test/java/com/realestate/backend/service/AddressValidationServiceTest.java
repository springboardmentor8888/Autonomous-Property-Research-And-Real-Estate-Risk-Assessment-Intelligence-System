package com.realestate.backend.service;

import com.realestate.backend.dto.AddressValidationRequestDTO;
import com.realestate.backend.dto.AddressValidationResponseDTO;
import com.realestate.backend.service.impl.AddressValidationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AddressValidationServiceTest {

    private AddressValidationService addressValidationService;

    @BeforeEach
    void setUp() {
        addressValidationService = new AddressValidationServiceImpl();
    }

    @Test
    void testValidAddress() {
        AddressValidationRequestDTO request = AddressValidationRequestDTO.builder()
                .streetAddress("123 Main St.")
                .city("Springfield")
                .state("IL")
                .zipCode("62701")
                .country("USA")
                .build();

        AddressValidationResponseDTO response = addressValidationService.validateAddress(request);

        assertNotNull(response);
        assertTrue(response.isValid());
        assertEquals("62701", response.getZipCode());
        assertTrue(response.getFormattedAddress().contains("Street")); // Standardized St -> Street
    }

    @Test
    void testInvalidPostalCode() {
        AddressValidationRequestDTO request = AddressValidationRequestDTO.builder()
                .streetAddress("456 Elm Rd")
                .city("Austin")
                .state("TX")
                .zipCode("INVALID_ZIP")
                .country("USA")
                .build();

        AddressValidationResponseDTO response = addressValidationService.validateAddress(request);

        assertNotNull(response);
        assertFalse(response.getSuggestions().isEmpty());
    }
}
