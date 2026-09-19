package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.UtilityInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository for utility connection information.
 * findByPropertyId returns the utility info for one property
 * (one current record per property, so Optional is used).
 */
public interface UtilityInfoRepository extends JpaRepository<UtilityInfo, Long> {

    Optional<UtilityInfo> findByPropertyId(Long propertyId);

}