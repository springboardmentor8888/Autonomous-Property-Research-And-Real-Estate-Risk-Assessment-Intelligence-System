package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RiskAssessmentDetailsRepository extends JpaRepository<RiskAssessmentDetails, Long> {
    Optional<RiskAssessmentDetails> findTopByPropertyIdOrderByAssessedAtDesc(Long propertyId);
}
