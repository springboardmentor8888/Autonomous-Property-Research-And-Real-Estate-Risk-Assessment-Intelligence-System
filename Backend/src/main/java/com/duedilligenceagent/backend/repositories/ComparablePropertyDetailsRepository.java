package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.ComparablePropertyDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComparablePropertyDetailsRepository extends JpaRepository<ComparablePropertyDetails, Long> {
	List<ComparablePropertyDetails> findByPropertyIdOrderByPricePerSqftAsc(Long propertyId);
}
