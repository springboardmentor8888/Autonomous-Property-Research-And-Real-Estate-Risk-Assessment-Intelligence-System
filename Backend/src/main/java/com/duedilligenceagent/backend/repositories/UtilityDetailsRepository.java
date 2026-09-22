package com.duedilligenceagent.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duedilligenceagent.backend.entities.UtilityDetails;

public interface UtilityDetailsRepository extends JpaRepository<UtilityDetails, Long> {

    List<UtilityDetails> findByPropertyId(Long propertyId);
}