package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.PropertyTaxHistory;

public interface PropertyTaxHistoryRepository
        extends JpaRepository<PropertyTaxHistory, Long> {

    List<PropertyTaxHistory> findByPropertyId(Long propertyId);
}