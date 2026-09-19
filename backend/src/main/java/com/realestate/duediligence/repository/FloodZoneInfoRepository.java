package com.realestate.duediligence.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.realestate.duediligence.entity.FloodZoneInfo;

/**
 * Repository for flood zone information. findByPropertyId returns the flood
 * zone record for one property.
 */
public interface FloodZoneInfoRepository extends JpaRepository<FloodZoneInfo, Long> {
	Optional<FloodZoneInfo> findByPropertyId(Long propertyId);
}
