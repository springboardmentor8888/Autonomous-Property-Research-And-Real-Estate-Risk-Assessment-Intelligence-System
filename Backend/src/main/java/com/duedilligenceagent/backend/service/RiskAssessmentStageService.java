package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.RiskAssessmentResponse;
import com.duedilligenceagent.backend.entities.AggregationRun;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.AggregationRunRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * <b>Risk-assessment stage of the diligence workflow</b>: calculates and
 * persists the risk assessment from the property's stored diligence
 * records. The aggregation pipeline is a separate, earlier stage — this
 * stage only links the latest run for provenance (null when the pipeline
 * has not been executed yet).
 * <p>
 * User-triggered — nothing runs automatically with the property search.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RiskAssessmentStageService {

    private final PropertyRepository propertyRepository;
    private final AggregationRunRepository aggregationRunRepository;
    private final RiskAssessmentService riskAssessmentService;

    /** Runs the stage: risk scoring from stored records, provenance from the latest pipeline run. */
    @Transactional
    public RiskAssessmentResponse run(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Property not found with id: " + propertyId));

        RiskAssessmentDetails assessment = riskAssessmentService.calculateAndPersist(property);

        Optional<AggregationRun> latestRun =
                aggregationRunRepository.findFirstByPropertyIdOrderByStartedAtDesc(propertyId);

        log.info("Risk-assessment stage completed for property id={}: overall={} (pipeline run={})",
                propertyId, assessment.getOverallScore(),
                latestRun.map(run -> run.getAggregationRunId()).orElse(null));

        return RiskAssessmentResponse.builder()
                .riskAssessmentId(assessment.getRiskAssessmentId())
                .propertyId(propertyId)
                .taxRisk(assessment.getTaxRisk())
                .legalRisk(assessment.getLegalRisk())
                .floodRisk(assessment.getFloodRisk())
                .permitCompliance(assessment.getPermitCompliance())
                .zoningCompliance(assessment.getZoningCompliance())
                .ownershipVerification(assessment.getOwnershipVerification())
                .overallScore(assessment.getOverallScore())
                .assessedAt(assessment.getAssessedAt())
                .riskTier(RiskAssessmentService.tierOf(assessment.getOverallScore()))
                .aggregationRunId(latestRun.map(AggregationRun::getAggregationRunId).orElse(null))
                .aggregationStatus(latestRun.map(AggregationRun::getStatus).orElse(null))
                .build();
    }
}
