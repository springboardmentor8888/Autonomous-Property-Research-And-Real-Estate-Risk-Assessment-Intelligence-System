package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.UtilityInformation;

public interface UtilityInformationRepository
        extends JpaRepository<UtilityInformation, Long> {

    List<UtilityInformation> findByPropertyId(Long propertyId);
}