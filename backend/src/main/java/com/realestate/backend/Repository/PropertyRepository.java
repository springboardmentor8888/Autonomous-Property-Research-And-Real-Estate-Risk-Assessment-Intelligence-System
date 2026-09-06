package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.realestate.backend.Entity.Property;

public interface PropertyRepository
        extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {

    List<Property> findByPropertyType(String propertyType);

    List<Property> findByAddressContainingIgnoreCase(String address);

    List<Property> findByPriceBetween(Double minPrice, Double maxPrice);
}