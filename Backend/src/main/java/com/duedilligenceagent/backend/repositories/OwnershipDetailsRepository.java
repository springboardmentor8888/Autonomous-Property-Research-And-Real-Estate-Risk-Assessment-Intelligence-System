package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.OwnershipDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OwnershipDetailsRepository extends JpaRepository<OwnershipDetails, Long> {
    List<OwnershipDetails> findByPropertyId(Long propertyId);
}
