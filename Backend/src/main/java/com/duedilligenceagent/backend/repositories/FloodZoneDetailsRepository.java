package com.duedilligenceagent.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duedilligenceagent.backend.entities.FloodZoneDetails;

public interface FloodZoneDetailsRepository extends JpaRepository<FloodZoneDetails, Long> {

    List<FloodZoneDetails> findByPropertyId(Long propertyId);
}