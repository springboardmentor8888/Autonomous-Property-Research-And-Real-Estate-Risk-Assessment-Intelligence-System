package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.RiskAssessmentResponse;
import com.duedilligenceagent.backend.entities.AggregationRun;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.AggregationRunRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Verifies the risk-assessment stage of the diligence workflow: it
 * calculates the risk from the stored records WITHOUT executing the
 * aggregation pipeline (a separate, earlier stage) and links the latest
 * existing run for provenance.
 */
@ExtendWith(MockitoExtension.class)
class RiskAssessmentStageServiceTest {

    @Mock private PropertyRepository propertyRepository;
    @Mock private AggregationRunRepository aggregationRunRepository;
    @Mock private RiskAssessmentService riskAssessmentService;

    @InjectMocks private RiskAssessmentStageService service;

    @Test
    void scoresRiskWithoutRunningAggregationAndLinksLatestRun() {
        Property property = new Property();
        property.setPropertyId(1004L);
        when(propertyRepository.findById(1004L)).thenReturn(Optional.of(property));
        when(riskAssessmentService.calculateAndPersist(property)).thenReturn(
                RiskAssessmentDetails.builder()
                        .riskAssessmentId(900L)
                        .propertyId(1004L)
                        .overallScore(BigDecimal.valueOf(56.5))
                        .taxRisk(BigDecimal.valueOf(75))
                        .build());
        when(aggregationRunRepository.findFirstByPropertyIdOrderByStartedAtDesc(1004L))
                .thenReturn(Optional.of(AggregationRun.builder()
                        .aggregationRunId(42L)
                        .status("COMPLETED_WITH_GAPS")
                        .build()));

        RiskAssessmentResponse response = service.run(1004L);

        // The pipeline is NOT executed here — only its latest run is linked.
        assertThat(response.getRiskTier()).isEqualTo("HIGH");
        assertThat(response.getOverallScore()).isEqualByComparingTo("56.5");
        assertThat(response.getAggregationRunId()).isEqualTo(42L);
        assertThat(response.getAggregationStatus()).isEqualTo("COMPLETED_WITH_GAPS");
    }

    @Test
    void provenanceIsNullWhenPipelineNeverRan() {
        Property property = new Property();
        property.setPropertyId(3L);
        when(propertyRepository.findById(3L)).thenReturn(Optional.of(property));
        when(riskAssessmentService.calculateAndPersist(property)).thenReturn(
                RiskAssessmentDetails.builder().riskAssessmentId(901L).propertyId(3L).build());
        when(aggregationRunRepository.findFirstByPropertyIdOrderByStartedAtDesc(3L))
                .thenReturn(Optional.empty());

        RiskAssessmentResponse response = service.run(3L);

        assertThat(response.getOverallScore()).isNull();
        assertThat(response.getRiskTier()).isEqualTo("INSUFFICIENT_DATA");
        assertThat(response.getAggregationRunId()).isNull();
        assertThat(response.getAggregationStatus()).isNull();
    }

    @Test
    void unknownPropertyThrows404() {
        when(propertyRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.run(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
