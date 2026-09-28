package com.realestate.backend.repository;

import com.realestate.backend.entity.Zoning;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZoningRepository extends JpaRepository<Zoning, Long> {

    List<Zoning> findByPropertyId(Long propertyId);

    List<Zoning> findByZoningCodeIgnoreCase(String zoningCode);

    List<Zoning> findByZoningTypeIgnoreCase(String zoningType);

    List<Zoning> findByStatusIgnoreCase(String status);
}