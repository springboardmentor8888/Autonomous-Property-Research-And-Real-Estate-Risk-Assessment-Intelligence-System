package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.RiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {
    Optional<RiskAssessment> findByPropertyId(Long propertyId);
}
