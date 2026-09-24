package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * Search history for a user: properties they searched via the search
     * pipeline, newest first. The static due-diligence seed rows
     * (searched_by null) are intentionally excluded — they are dataset
     * records, not searches.
     */
    @Query("SELECT p FROM Property p WHERE p.searchedBy = :userId ORDER BY p.createdAt DESC")
    List<Property> findSearchHistory(@Param("userId") Long userId);
}
