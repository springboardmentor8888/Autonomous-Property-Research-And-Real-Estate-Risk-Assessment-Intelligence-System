package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.BuildingPermitRecord;

public interface BuildingPermitRecordRepository
        extends JpaRepository<BuildingPermitRecord, Long> {

    List<BuildingPermitRecord> findByPropertyId(Long propertyId);
}