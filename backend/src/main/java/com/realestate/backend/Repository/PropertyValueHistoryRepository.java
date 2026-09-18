package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.PropertyValueHistory;

public interface PropertyValueHistoryRepository
        extends JpaRepository<PropertyValueHistory, Long> {

    List<PropertyValueHistory> findByPropertyId(Long propertyId);
}