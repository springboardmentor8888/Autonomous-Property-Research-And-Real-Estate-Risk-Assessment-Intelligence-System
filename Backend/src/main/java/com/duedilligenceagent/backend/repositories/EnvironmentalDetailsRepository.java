package com.duedilligenceagent.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duedilligenceagent.backend.entities.EnvironmentalDetails;

public interface EnvironmentalDetailsRepository extends JpaRepository<EnvironmentalDetails, Long> {

    List<EnvironmentalDetails> findByPropertyId(Long propertyId);
}