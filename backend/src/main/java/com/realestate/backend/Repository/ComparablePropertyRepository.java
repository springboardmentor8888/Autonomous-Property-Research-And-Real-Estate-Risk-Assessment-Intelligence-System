package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.ComparableProperty;

public interface ComparablePropertyRepository
        extends JpaRepository<ComparableProperty, Long> {

    List<ComparableProperty> findByTargetPropertyId(Long targetPropertyId);

    List<ComparableProperty> findByComparablePropertyId(Long comparablePropertyId);
}