package com.duedilligenceagent.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duedilligenceagent.backend.entities.ZoningDetails;

public interface ZoningDetailsRepository extends JpaRepository<ZoningDetails, Long> {

    List<ZoningDetails> findByPropertyId(Long propertyId);
}