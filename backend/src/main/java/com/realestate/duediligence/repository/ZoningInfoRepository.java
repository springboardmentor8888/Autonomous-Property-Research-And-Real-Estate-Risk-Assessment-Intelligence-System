package com.realestate.duediligence.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.realestate.duediligence.entity.ZoningInfo;

/**
 * Repository for zoning information. findByPropertyId returns the zoning record
 * for one property (a property has one current zoning record, not many, so
 * Optional is used here instead of List).
 */
public interface ZoningInfoRepository extends JpaRepository<ZoningInfo, Long> {
	Optional<ZoningInfo> findByPropertyId(Long propertyId);
}
