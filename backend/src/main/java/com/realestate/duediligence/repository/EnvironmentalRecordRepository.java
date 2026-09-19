package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.EnvironmentalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository for environmental records.
 * findByPropertyId returns the environmental assessment for one property
 * (one current assessment per property, so Optional is used).
 */
public interface EnvironmentalRecordRepository extends JpaRepository<EnvironmentalRecord, Long> {

    Optional<EnvironmentalRecord> findByPropertyId(Long propertyId);

}