package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.AggregationResponse;
import com.duedilligenceagent.backend.dto.RiskAssessmentResponse;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <b>Stage 1 of the diligence workflow</b>: executes the stored-data
 * aggregation pipeline (the inventory of the property's diligence records)
 * and then calculates + persists the risk assessment from those records.
 * <p>
 * User-triggered — nothing runs automatically with the property search.
 * The response carries the risk scores, the derived tier and the
 * aggregation-run provenance so the UI can show exactly which pipeline
 * run produced the assessment.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RiskAssessmentStageService {

    private final PropertyRepository propertyRepository;
    private final AggregationService aggregationService;
    private final RiskAssessmentService riskAssessmentService;

    /** Runs the stage: aggregation inventory → risk scoring → persist. */
    @Transactional
    public RiskAssessmentResponse run(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Property not found with id: " + propertyId));

        AggregationResponse aggregation = aggregationService.aggregate(propertyId, null);
        RiskAssessmentDetails assessment = riskAssessmentService.calculateAndPersist(property);

        log.info("Risk-assessment stage completed for property id={}: overall={} (run id={})",
                propertyId, assessment.getOverallScore(), aggregation.getAggregationRunId());

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
                .aggregationRunId(aggregation.getAggregationRunId())
                .aggregationStatus(aggregation.getStatus())
                .build();
    }
}
