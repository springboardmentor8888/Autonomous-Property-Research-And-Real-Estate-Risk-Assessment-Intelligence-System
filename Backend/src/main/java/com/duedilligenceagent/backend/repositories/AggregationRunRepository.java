package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.AggregationRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AggregationRunRepository extends JpaRepository<AggregationRun, Long> {

    List<AggregationRun> findByPropertyIdOrderByStartedAtDesc(Long propertyId);

    /** Latest aggregation run for a property (report provenance link). */
    Optional<AggregationRun> findFirstByPropertyIdOrderByStartedAtDesc(Long propertyId);
}
