package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.AddressValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressValidationRepository extends JpaRepository<AddressValidation, Long> {
    List<AddressValidation> findByPropertyId(Long propertyId);
}
