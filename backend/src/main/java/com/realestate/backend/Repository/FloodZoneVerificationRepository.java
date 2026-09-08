package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.FloodZoneVerification;

public interface FloodZoneVerificationRepository
        extends JpaRepository<FloodZoneVerification, Long> {

    List<FloodZoneVerification> findByPropertyId(Long propertyId);
}