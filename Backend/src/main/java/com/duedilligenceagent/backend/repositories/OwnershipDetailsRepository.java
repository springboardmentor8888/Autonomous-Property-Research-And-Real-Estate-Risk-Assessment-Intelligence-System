package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.OwnershipDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OwnershipDetailsRepository extends JpaRepository<OwnershipDetails, Long> {

    Optional<OwnershipDetails> findByPropertyId(Long propertyId);
}
