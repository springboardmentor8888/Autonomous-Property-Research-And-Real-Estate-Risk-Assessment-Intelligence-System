package com.realestate.duediligence.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.realestate.duediligence.entity.OwnershipRecord;

/**
 * Repository for ownership records. findByPropertyId returns all ownership
 * history for one property.
 */
public interface OwnershipRecordRepository extends JpaRepository<OwnershipRecord, Long> {
	List<OwnershipRecord> findByPropertyId(Long propertyId);
}
