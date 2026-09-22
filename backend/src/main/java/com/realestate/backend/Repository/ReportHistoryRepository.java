package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.ReportHistory;

public interface ReportHistoryRepository extends JpaRepository<ReportHistory, Long> {

    List<ReportHistory> findByPropertyId(Long propertyId);

    List<ReportHistory> findByUserId(Long userId);
}