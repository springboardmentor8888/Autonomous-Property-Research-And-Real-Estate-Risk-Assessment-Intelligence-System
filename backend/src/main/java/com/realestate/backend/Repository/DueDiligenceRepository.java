package com.realestate.backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.DueDiligence;

public interface DueDiligenceRepository extends JpaRepository<DueDiligence, Long> {
	 Optional<DueDiligence> findByPropertyId(Long propertyId);

}