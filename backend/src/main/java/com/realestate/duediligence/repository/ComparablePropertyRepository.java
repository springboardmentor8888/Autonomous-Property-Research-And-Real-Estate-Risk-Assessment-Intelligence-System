package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.ComparableProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComparablePropertyRepository extends JpaRepository<ComparableProperty, Long> {
    List<ComparableProperty> findByPropertyId(Long propertyId);
}
