package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.DueDiligenceReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DueDiligenceReportRepository extends JpaRepository<DueDiligenceReport, Long> {
    List<DueDiligenceReport> findByPropertyIdOrderByGeneratedAtDesc(Long propertyId);
}
