package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.ProviderObservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProviderObservationRepository extends JpaRepository<ProviderObservation, Long> {
    List<ProviderObservation> findByAggregationRunIdOrderByRetrievedAtAsc(Long aggregationRunId);
}
