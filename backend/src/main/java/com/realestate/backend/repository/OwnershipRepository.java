package com.realestate.backend.repository;

import com.realestate.backend.entity.Ownership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OwnershipRepository extends JpaRepository<Ownership, Long> {

    List<Ownership> findByPropertyId(Long propertyId);
}