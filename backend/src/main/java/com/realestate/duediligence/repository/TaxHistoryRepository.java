package com.realestate.duediligence.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.realestate.duediligence.entity.TaxHistory;

/**
 * Repository for tax history records. findByPropertyId returns all tax years
 * recorded for one property.
 */
public interface TaxHistoryRepository extends JpaRepository<TaxHistory, Long> {
	List<TaxHistory> findByPropertyId(Long propertyId);
}
