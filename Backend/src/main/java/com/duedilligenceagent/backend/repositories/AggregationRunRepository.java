package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.AggregationRun;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AggregationRunRepository extends JpaRepository<AggregationRun, Long> {
}
