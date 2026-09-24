package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.ComparablePropertyDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComparablePropertyDetailsRepository extends JpaRepository<ComparablePropertyDetails, Long> {

    /** All comparable listings stored for a property. */
    List<ComparablePropertyDetails> findByPropertyId(Long propertyId);
}
