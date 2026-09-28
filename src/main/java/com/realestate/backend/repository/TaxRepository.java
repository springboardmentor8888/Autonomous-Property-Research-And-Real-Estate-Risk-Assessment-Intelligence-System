package com.realestate.backend.repository;

import com.realestate.backend.entity.Tax;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaxRepository extends JpaRepository<Tax, Long> {

    List<Tax> findByPropertyId(Long propertyId);

    List<Tax> findByTaxYear(Integer taxYear);

    List<Tax> findByStatusIgnoreCase(String status);

    List<Tax> findByPropertyIdAndTaxYear(Long propertyId, Integer taxYear);

    List<Tax> findByPropertyIdAndStatusIgnoreCase(Long propertyId, String status);
}