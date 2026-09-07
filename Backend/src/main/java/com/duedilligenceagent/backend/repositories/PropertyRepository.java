package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA repository for {@link Property}. Spring Data provides the standard
 * CRUD implementation; user-scoped queries will be added once the
 * Property <-> User relationship is modelled on the entity.
 */
@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByCityIgnoreCase(String city);

    List<Property> findByStateIgnoreCase(String state);

    List<Property> findByPropertyTypeIgnoreCase(String propertyType);
}
