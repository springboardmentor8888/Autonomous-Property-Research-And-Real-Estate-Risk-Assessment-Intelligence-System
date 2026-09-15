package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.TaxRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaxRecordRepository extends JpaRepository<TaxRecord, Long> {
    List<TaxRecord> findByPropertyId(Long propertyId);
}
