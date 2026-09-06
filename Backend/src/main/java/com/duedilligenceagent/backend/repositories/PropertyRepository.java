package com.duedilligenceagent.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duedilligenceagent.backend.entities.Property;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByCityIgnoreCase(String city);

    List<Property> findByStateIgnoreCase(String state);

    List<Property> findByPropertyTypeIgnoreCase(String propertyType);
}