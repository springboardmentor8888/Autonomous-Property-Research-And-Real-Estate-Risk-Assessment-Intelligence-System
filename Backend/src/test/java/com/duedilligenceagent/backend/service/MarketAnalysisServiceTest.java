package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.DiligenceDataResponse;
import com.duedilligenceagent.backend.dto.MarketAnalysisResponse;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Verifies stage 2 of the diligence workflow: the market-trends and
 * comparable-property analysis computed from stored data — positioning
 * math, comparables statistics, trend pick and the explicit no-data
 * states.
 */
@ExtendWith(MockitoExtension.class)
class MarketAnalysisServiceTest {

    @Mock private PropertyRepository propertyRepository;
    @Mock private DiligenceService diligenceService;

    @InjectMocks private MarketAnalysisService service;

    private static Property property(long id, String price, String pricePerSqft) {
        Property p = new Property();
        p.setPropertyId(id);
        if (price != null) p.setPrice(new BigDecimal(price));
        if (pricePerSqft != null) p.setPricePerSqft(new BigDecimal(pricePerSqft));
        return p;
    }

    private static DiligenceDataResponse.ComparableRecord comparable(String price, String perSqft) {
        return DiligenceDataResponse.ComparableRecord.builder()
                .price(price == null ? null : new BigDecimal(price))
                .pricePerSqft(perSqft == null ? null : new BigDecimal(perSqft))
                .build();
    }

    @Test
    void positionsPropertyBelowMarketWhenPriceUnderAverage() {
        Property property = property(2001L, "8000000", null);
        when(propertyRepository.findById(2001L)).thenReturn(Optional.of(property));
        when(diligenceService.getDiligenceData(2001L)).thenReturn(DiligenceDataResponse.builder()
                .comparables(List.of(
                        comparable("10000000", null),
                        comparable("10000000", null),
                        comparable("10000000", null)))
                .build());

        MarketAnalysisResponse response = service.analyze(2001L);

        assertThat(response.getPositioning().getVerdict()).isEqualTo("BELOW_MARKET");
        // (8,000,000 − 10,000,000) / 10,000,000 × 100 = −20.0
        assertThat(response.getPositioning().getDeltaPercent()).isEqualByComparingTo("-20.0");
        assertThat(response.getComparables().getCount()).isEqualTo(3);
        assertThat(response.getComparables().getAveragePrice()).isEqualByComparingTo("10000000");
        assertThat(response.getSummary()).contains("20.0% below the comparable-market average");
    }

    @Test
    void positionsPropertyAboveMarketWhenPriceOverAverage() {
        Property property = property(2002L, "12000000", null);
        when(propertyRepository.findById(2002L)).thenReturn(Optional.of(property));
        when(diligenceService.getDiligenceData(2002L)).thenReturn(DiligenceDataResponse.builder()
                .comparables(List.of(comparable("10000000", null)))
                .build());

        MarketAnalysisResponse response = service.analyze(2002L);

        assertThat(response.getPositioning().getVerdict()).isEqualTo("ABOVE_MARKET");
        assertThat(response.getPositioning().getDeltaPercent()).isEqualByComparingTo("20.0");
    }

    @Test
    void positionsPropertyAlignedWithinTolerance() {
        Property property = property(2003L, "10500000", null);
        when(propertyRepository.findById(2003L)).thenReturn(Optional.of(property));
        when(diligenceService.getDiligenceData(2003L)).thenReturn(DiligenceDataResponse.builder()
                .comparables(List.of(comparable("10000000", null)))
                .build());

        MarketAnalysisResponse response = service.analyze(2003L);

        // +5% is within the ±10% tolerance.
        assertThat(response.getPositioning().getVerdict()).isEqualTo("ALIGNED");
        assertThat(response.getSummary()).contains("in line with the comparable market");
    }

    @Test
    void fallsBackToPricePerSqftWhenTotalPriceAbsent() {
        Property property = property(2004L, null, "9000");
        when(propertyRepository.findById(2004L)).thenReturn(Optional.of(property));
        when(diligenceService.getDiligenceData(2004L)).thenReturn(DiligenceDataResponse.builder()
                .comparables(List.of(comparable(null, "8000")))
                .build());

        MarketAnalysisResponse response = service.analyze(2004L);

        assertThat(response.getPositioning().getVerdict()).isEqualTo("ABOVE_MARKET");
        assertThat(response.getPositioning().getBasis()).isEqualTo("price per sqft");
        assertThat(response.getPositioning().getDeltaPercent()).isEqualByComparingTo("12.5");
    }

    @Test
    void datasetPropertyWithoutPriceGetsExplicitUnknownPosition() {
        // Seed-dataset properties carry no price — no fabricated positioning.
        Property property = property(1004L, null, null);
        when(propertyRepository.findById(1004L)).thenReturn(Optional.of(property));
        when(diligenceService.getDiligenceData(1004L)).thenReturn(DiligenceDataResponse.builder()
                .comparables(List.of(comparable("10000000", null), comparable("11000000", null)))
                .build());

        MarketAnalysisResponse response = service.analyze(1004L);

        assertThat(response.getPositioning().getVerdict()).isEqualTo("UNKNOWN");
        assertThat(response.getPositioning().getNote())
                .contains("no price on record");
        assertThat(response.getComparables().getAveragePrice()).isEqualByComparingTo("10500000");
        assertThat(response.getSummary()).contains("could not be determined");
    }

    @Test
    void noComparablesStoredIsAnExplicitState() {
        Property property = property(3L, null, null);
        when(propertyRepository.findById(3L)).thenReturn(Optional.of(property));
        when(diligenceService.getDiligenceData(3L)).thenReturn(DiligenceDataResponse.builder().build());

        MarketAnalysisResponse response = service.analyze(3L);

        assertThat(response.getComparables()).isNull();
        assertThat(response.getPositioning().getVerdict()).isEqualTo("NO_COMPARABLES");
        assertThat(response.getSummary()).contains("No comparable listings are stored");
    }

    @Test
    void picksLatestTrendRecordIntoSummary() {
        Property property = property(1025L, null, null);
        when(propertyRepository.findById(1025L)).thenReturn(Optional.of(property));
        when(diligenceService.getDiligenceData(1025L)).thenReturn(DiligenceDataResponse.builder()
                .comparables(List.of(comparable("9000000", "8500")))
                .marketTrends(List.of(DiligenceDataResponse.MarketTrendRecord.builder()
                        .locality("Sarjapur")
                        .period("Q3-2025")
                        .avgPricePerSqft(new BigDecimal("9100"))
                        .supplyCount(45)
                        .build()))
                .build());

        MarketAnalysisResponse response = service.analyze(1025L);

        assertThat(response.getTrend()).isNotNull();
        assertThat(response.getTrend().getLocality()).isEqualTo("Sarjapur");
        assertThat(response.getSummary()).contains("Sarjapur (Q3-2025)");
        assertThat(response.getSummary()).contains("9100/sqft");
        assertThat(response.getSummary()).contains("45 active listings");
    }

    @Test
    void unknownPropertyThrows404() {
        when(propertyRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.analyze(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
