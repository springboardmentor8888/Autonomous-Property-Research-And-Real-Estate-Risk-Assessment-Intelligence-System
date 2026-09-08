package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.ZoningInformation;

public interface ZoningInformationRepository
        extends JpaRepository<ZoningInformation, Long> {

    List<ZoningInformation> findByPropertyId(Long propertyId);
}