package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.OwnershipRecord;

public interface OwnershipRecordRepository
        extends JpaRepository<OwnershipRecord, Long> {

    List<OwnershipRecord> findByPropertyId(Long propertyId);
}