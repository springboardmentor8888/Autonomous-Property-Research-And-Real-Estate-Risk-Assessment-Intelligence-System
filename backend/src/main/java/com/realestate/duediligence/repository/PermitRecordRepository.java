package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.PermitRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PermitRecordRepository extends JpaRepository<PermitRecord, Long> {
    List<PermitRecord> findByPropertyId(Long propertyId);
}
