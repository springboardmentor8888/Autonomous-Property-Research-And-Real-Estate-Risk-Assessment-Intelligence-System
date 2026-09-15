package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.DueDiligenceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<DueDiligenceReport, String> {
    List<DueDiligenceReport> findByPropertyId(Long propertyId);
}
