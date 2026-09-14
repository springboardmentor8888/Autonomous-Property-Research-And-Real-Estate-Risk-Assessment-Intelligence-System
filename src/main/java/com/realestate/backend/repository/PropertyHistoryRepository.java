package com.realestate.backend.repository;

import com.realestate.backend.entity.PropertyHistory;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyHistoryRepository extends JpaRepository<PropertyHistory, Long> {

    List<PropertyHistory> findByPropertyId(Long propertyId, Sort sort);
}
