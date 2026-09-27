package com.realestate.backend.repository;

import com.realestate.backend.entity.FloodStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloodStorageRepository extends JpaRepository<FloodStorage, Long> {

List<FloodStorage> findByPropertyId(Long propertyId);

}