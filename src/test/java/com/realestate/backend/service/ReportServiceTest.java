package com.realestate.backend.service;

import com.realestate.backend.dto.CmaAnalysisResponseDTO;
import com.realestate.backend.dto.ComparablePropertyDTO;
import com.realestate.backend.dto.PropertyResponseDTO;
import com.realestate.backend.service.impl.ExcelReportServiceImpl;
import com.realestate.backend.service.impl.PdfReportServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

class ReportServiceTest {

    private PropertyService propertyService;
    private CmaService cmaService;
    private PdfReportService pdfReportService;
    private ExcelReportService excelReportService;

    @BeforeEach
    void setUp() {
        propertyService = Mockito.mock(PropertyService.class);
        cmaService = Mockito.mock(CmaService.class);

        pdfReportService = new PdfReportServiceImpl(propertyService, cmaService);
        excelReportService = new ExcelReportServiceImpl(propertyService, cmaService);

        PropertyResponseDTO property = new PropertyResponseDTO();
        property.setId(6L);
        property.setTitle("Kothrud Heritage Bungalow & Garden");
        property.setAddress("Plot 14, Mayur Colony, Kothrud");
        property.setCity("Pune");
        property.setState("MH");
        property.setZipCode("411038");
        property.setPrice(new BigDecimal("28500000.00"));
        property.setSquareFeet(3400.0);
        property.setBedrooms(4);
        property.setBathrooms(4);
        property.setPropertyType("Villa");

        ComparablePropertyDTO comp = new ComparablePropertyDTO();
        comp.setId(8L);
        comp.setTitle("Baner Smart Condominium");
        comp.setAddress("Tower B-1504, Pancard Club Road, Baner");
        comp.setCity("Pune");
        comp.setPrice(new BigDecimal("14500000.00"));
        comp.setPricePerSqFt(new BigDecimal("9354.84"));
        comp.setSquareFeet(1550.0);
        comp.setBedrooms(3);
        comp.setBathrooms(3);
        comp.setPropertyType("Condominium");
        comp.setSimilarityScore(78.0);
        comp.setCorrelationNote("Submarket match in Pune");

        CmaAnalysisResponseDTO cma = CmaAnalysisResponseDTO.builder()
                .subjectProperty(property)
                .comparableProperties(List.of(comp))
                .subjectPricePerSqFt(new BigDecimal("8382.35"))
                .averagePricePerSqFt(new BigDecimal("9354.84"))
                .estimatedFairMarketValue(new BigDecimal("31806456.00"))
                .priceVariancePercentage(-10.4)
                .marketTrend("BULLISH")
                .valuationAssessment("UNDERVALUED")
                .confidenceScore(93.8)
                .summary("CMA Analysis complete: Subject is undervalued compared to market.")
                .build();

        when(propertyService.getPropertyById(anyLong())).thenReturn(property);
        when(cmaService.analyzeProperty(anyLong())).thenReturn(cma);
    }

    @Test
    void testGeneratePropertyPdf() {
        ByteArrayInputStream pdfStream = pdfReportService.generatePropertyPdf(6L);

        assertNotNull(pdfStream);
        assertTrue(pdfStream.available() > 0, "PDF stream should contain binary document bytes");
    }

    @Test
    void testGeneratePropertyExcel() {
        ByteArrayInputStream excelStream = excelReportService.generatePropertyExcel(6L);

        assertNotNull(excelStream);
        assertTrue(excelStream.available() > 0, "Excel stream should contain binary document bytes");
    }
}
