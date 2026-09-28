package com.realestate.backend.service;

import com.realestate.backend.dto.CmaAnalysisResponseDTO;
import com.realestate.backend.dto.PropertyResponseDTO;
import com.realestate.backend.entity.Property;
import com.realestate.backend.repository.PropertyRepository;
import com.realestate.backend.service.impl.CmaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class CmaServiceTest {

    private PropertyRepository propertyRepository;
    private PropertyService propertyService;
    private CmaService cmaService;

    @BeforeEach
    void setUp() {
        propertyRepository = Mockito.mock(PropertyRepository.class);
        propertyService = Mockito.mock(PropertyService.class);
        cmaService = new CmaServiceImpl(propertyRepository, propertyService);
    }

    @Test
    void testAnalyzePropertyCMA() {
        PropertyResponseDTO subject = new PropertyResponseDTO();
        subject.setId(6L);
        subject.setTitle("Kothrud Heritage Bungalow");
        subject.setCity("Pune");
        subject.setPrice(new BigDecimal("28500000.00"));
        subject.setSquareFeet(3400.0);
        subject.setBedrooms(4);
        subject.setPropertyType("Villa");

        Property comp1 = new Property();
        comp1.setId(8L);
        comp1.setTitle("Baner Smart Condominium");
        comp1.setCity("Pune");
        comp1.setPrice(new BigDecimal("14500000.00"));
        comp1.setSquareFeet(1550.0);
        comp1.setBedrooms(3);
        comp1.setPropertyType("Condominium");

        when(propertyService.getPropertyById(anyLong())).thenReturn(subject);
        when(propertyRepository.findByCityIgnoreCase(anyString())).thenReturn(List.of(comp1));

        CmaAnalysisResponseDTO response = cmaService.analyzeProperty(6L);

        assertNotNull(response);
        assertEquals("Pune", response.getSubjectProperty().getCity());
        assertFalse(response.getComparableProperties().isEmpty());
        assertNotNull(response.getAveragePricePerSqFt());
        assertNotNull(response.getEstimatedFairMarketValue());
        assertNotNull(response.getValuationAssessment());
        assertTrue(response.getConfidenceScore() > 0);
    }
}
