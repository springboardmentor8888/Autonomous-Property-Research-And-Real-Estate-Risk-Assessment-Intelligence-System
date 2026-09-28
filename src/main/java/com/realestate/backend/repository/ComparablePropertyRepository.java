package com.realestate.backend.repository;

import com.realestate.backend.entity.ComparableProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComparablePropertyRepository
extends JpaRepository<ComparableProperty, Long> {

List<ComparableProperty> findByPropertyId(Long propertyId);

List<ComparableProperty> findByComparablePropertyId(Long comparablePropertyId);

}