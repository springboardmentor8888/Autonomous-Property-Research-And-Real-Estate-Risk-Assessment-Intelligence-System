package com.realestate.duediligence.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.realestate.duediligence.entity.PermitRecord;

/**
 * Repository for building permit records. findByPropertyId returns all permits
 * recorded for one property.
 */
public interface PermitRecordRepository extends JpaRepository<PermitRecord, Long> {
	List<PermitRecord> findByPropertyId(Long propertyId);
}
