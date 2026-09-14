package com.realestate.backend.repository;

import com.realestate.backend.entity.FloodStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FloodStorageRepository extends JpaRepository<FloodStorage, Long> {
}
