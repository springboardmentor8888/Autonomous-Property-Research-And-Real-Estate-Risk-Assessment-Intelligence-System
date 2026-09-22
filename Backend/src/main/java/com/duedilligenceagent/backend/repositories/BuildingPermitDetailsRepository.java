package com.duedilligenceagent.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duedilligenceagent.backend.entities.BuildingPermitDetails;

public interface BuildingPermitDetailsRepository extends JpaRepository<BuildingPermitDetails, Long> {

    List<BuildingPermitDetails> findByPropertyId(Long propertyId);
}