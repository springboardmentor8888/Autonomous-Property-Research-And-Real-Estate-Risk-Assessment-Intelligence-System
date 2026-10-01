package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.PropertyMonitoring;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PropertyMonitoringRepository extends JpaRepository<PropertyMonitoring, Long> {

    Optional<PropertyMonitoring> findByUserIdAndPropertyId(Long userId, Long propertyId);

    List<PropertyMonitoring> findByUserIdAndEnabledTrue(Long userId);

    /** Active monitors across all users — the admin analytics metric. */
    long countByEnabledTrue();
}
