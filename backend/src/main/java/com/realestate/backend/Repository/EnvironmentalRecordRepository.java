package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.EnvironmentalRecord;

public interface EnvironmentalRecordRepository
        extends JpaRepository<EnvironmentalRecord, Long> {

    List<EnvironmentalRecord> findByPropertyId(Long propertyId);
}