package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.PropertyHistory;

public interface PropertyHistoryRepository extends JpaRepository<PropertyHistory, Long> {

    List<PropertyHistory> findByPropertyId(Long propertyId);
}