package com.realestate.backend.repository;

import com.realestate.backend.entity.Permit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermitRepository extends JpaRepository<Permit, Long> {

    List<Permit> findByPropertyId(Long propertyId);

    List<Permit> findByStatus(String status);
}