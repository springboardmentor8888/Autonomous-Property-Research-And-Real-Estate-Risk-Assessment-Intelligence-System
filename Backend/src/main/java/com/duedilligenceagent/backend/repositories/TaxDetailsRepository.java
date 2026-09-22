package com.duedilligenceagent.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duedilligenceagent.backend.entities.TaxDetails;

public interface TaxDetailsRepository extends JpaRepository<TaxDetails, Long> {

    List<TaxDetails> findByPropertyId(Long propertyId);
}