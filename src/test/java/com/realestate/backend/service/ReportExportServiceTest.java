package com.realestate.backend.service;

import com.realestate.backend.dto.CmaAnalysisResponseDTO;
import com.realestate.backend.dto.ComparablePropertyDTO;
import com.realestate.backend.dto.PropertyResponseDTO;
import com.realestate.backend.service.impl.ExcelReportServiceImpl;
import com.realestate.backend.service.impl.PdfReportServiceImpl;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

class ReportExportServiceTest {

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

        PropertyResponseDTO subject = new PropertyResponseDTO();
        subject.setId(6L);
        subject.setTitle("Kothrud Heritage Bungalow");
        subject.setCity("Pune");
        subject.setState("MH");
        subject.setZipCode("411038");
        subject.setAddress("Mayur Colony, Kothrud");
        subject.setPrice(new BigDecimal("28500000.00"));
        subject.setSquareFeet(3400.0);
        subject.setBedrooms(4);
        subject.setBathrooms(4);
        subject.setPropertyType("Villa");

        ComparablePropertyDTO comp1 = ComparablePropertyDTO.builder()
                .id(8L)
                .title("Baner High-Rise Smart Condominium")
                .address("Pancard Club Road, Baner")
                .city("Pune")
                .price(new BigDecimal("14500000.00"))
                .squareFeet(1550.0)
                .pricePerSqFt(new BigDecimal("9354.84"))
                .bedrooms(3)
                .bathrooms(3)
                .propertyType("Condominium")
                .similarityScore(85.0)
                .correlationNote("Submarket match in Pune")
                .build();

        CmaAnalysisResponseDTO cma = CmaAnalysisResponseDTO.builder()
                .subjectProperty(subject)
                .comparableProperties(List.of(comp1))
                .subjectPricePerSqFt(new BigDecimal("8382.35"))
                .averagePricePerSqFt(new BigDecimal("9354.84"))
                .estimatedFairMarketValue(new BigDecimal("31806456.00"))
                .priceVariancePercentage(-10.4)
                .marketTrend("BULLISH")
                .valuationAssessment("UNDERVALUED")
                .confidenceScore(93.8)
                .summary("Evaluated against comparable properties in Pune. Status: UNDERVALUED.")
                .build();

        when(propertyService.getPropertyById(anyLong())).thenReturn(subject);
        when(cmaService.analyzeProperty(anyLong())).thenReturn(cma);
    }

    @Test
    void testGeneratePropertyPdf() throws IOException {
        ByteArrayInputStream stream = pdfReportService.generatePropertyPdf(6L);
        assertNotNull(stream);
        assertTrue(stream.available() > 0);

        byte[] header = new byte[4];
        int read = stream.read(header);
        assertEquals(4, read);
        String headerStr = new String(header);
        assertEquals("%PDF", headerStr);
    }

    @Test
    void testGeneratePropertyExcel() throws IOException {
        ByteArrayInputStream stream = excelReportService.generatePropertyExcel(6L);
        assertNotNull(stream);
        assertTrue(stream.available() > 0);

        try (XSSFWorkbook workbook = new XSSFWorkbook(stream)) {
            assertEquals(2, workbook.getNumberOfSheets());
            assertNotNull(workbook.getSheet("Due Diligence Summary"));
            assertNotNull(workbook.getSheet("Benchmark Comps (CMA)"));
        }
    }
}
