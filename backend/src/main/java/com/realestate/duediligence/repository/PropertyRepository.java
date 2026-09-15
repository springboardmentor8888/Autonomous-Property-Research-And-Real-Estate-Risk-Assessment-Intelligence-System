package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByAddressContainingIgnoreCase(String address);
}
