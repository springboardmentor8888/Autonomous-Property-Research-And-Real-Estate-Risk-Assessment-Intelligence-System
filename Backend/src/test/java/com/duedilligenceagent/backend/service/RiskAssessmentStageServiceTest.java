package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.AggregationResponse;
import com.duedilligenceagent.backend.dto.RiskAssessmentResponse;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Verifies stage 1 of the diligence workflow: the aggregation pipeline
 * runs BEFORE the risk scoring, and the response carries the tier and
 * the aggregation-run provenance.
 */
@ExtendWith(MockitoExtension.class)
class RiskAssessmentStageServiceTest {

    @Mock private PropertyRepository propertyRepository;
    @Mock private AggregationService aggregationService;
    @Mock private RiskAssessmentService riskAssessmentService;

    @InjectMocks private RiskAssessmentStageService service;

    @Test
    void runsAggregationBeforeRiskScoringAndReturnsProvenance() {
        Property property = new Property();
        property.setPropertyId(1004L);
        when(propertyRepository.findById(1004L)).thenReturn(Optional.of(property));
        when(aggregationService.aggregate(1004L, null)).thenReturn(AggregationResponse.builder()
                .aggregationRunId(42L).status("COMPLETED_WITH_GAPS").build());
        when(riskAssessmentService.calculateAndPersist(property)).thenReturn(
                RiskAssessmentDetails.builder()
                        .riskAssessmentId(900L)
                        .propertyId(1004L)
                        .overallScore(BigDecimal.valueOf(56.5))
                        .taxRisk(BigDecimal.valueOf(75))
                        .build());

        RiskAssessmentResponse response = service.run(1004L);

        // The pipeline inventory runs first, then the risk scoring.
        InOrder inOrder = Mockito.inOrder(aggregationService, riskAssessmentService);
        inOrder.verify(aggregationService).aggregate(1004L, null);
        inOrder.verify(riskAssessmentService).calculateAndPersist(property);

        assertThat(response.getRiskTier()).isEqualTo("HIGH");
        assertThat(response.getOverallScore()).isEqualByComparingTo("56.5");
        assertThat(response.getAggregationRunId()).isEqualTo(42L);
        assertThat(response.getAggregationStatus()).isEqualTo("COMPLETED_WITH_GAPS");
    }

    @Test
    void insufficientDataAssessmentCarriesTierAndRun() {
        Property property = new Property();
        property.setPropertyId(3L);
        when(propertyRepository.findById(3L)).thenReturn(Optional.of(property));
        when(aggregationService.aggregate(3L, null)).thenReturn(AggregationResponse.builder()
                .aggregationRunId(43L).status("COMPLETED_WITH_GAPS").build());
        when(riskAssessmentService.calculateAndPersist(property)).thenReturn(
                RiskAssessmentDetails.builder().riskAssessmentId(901L).propertyId(3L).build());

        RiskAssessmentResponse response = service.run(3L);

        assertThat(response.getOverallScore()).isNull();
        assertThat(response.getRiskTier()).isEqualTo("INSUFFICIENT_DATA");
        assertThat(response.getAggregationRunId()).isEqualTo(43L);
    }

    @Test
    void unknownPropertyThrows404() {
        when(propertyRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.run(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
