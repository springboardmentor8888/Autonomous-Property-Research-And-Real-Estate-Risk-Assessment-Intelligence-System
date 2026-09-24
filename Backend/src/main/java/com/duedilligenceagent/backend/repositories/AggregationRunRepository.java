package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.AggregationRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AggregationRunRepository extends JpaRepository<AggregationRun, Long> {

    List<AggregationRun> findByPropertyIdOrderByStartedAtDesc(Long propertyId);
}
