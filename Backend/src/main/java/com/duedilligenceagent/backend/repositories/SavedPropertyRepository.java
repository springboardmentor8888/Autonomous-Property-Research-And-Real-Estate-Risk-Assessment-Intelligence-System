package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.SavedProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA repository for {@link SavedProperty}. A user's saved list is queried
 * newest first; the (user, property) pair is unique, so the find-by-pair
 * lookup drives idempotent saves.
 */
@Repository
public interface SavedPropertyRepository extends JpaRepository<SavedProperty, Long> {

    /** The user's saved properties, newest first. */
    List<SavedProperty> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** The saved row for an exact (user, property) pair, if present. */
    Optional<SavedProperty> findByUserIdAndPropertyId(Long userId, Long propertyId);

    /** Whether the user has saved the given property. */
    boolean existsByUserIdAndPropertyId(Long userId, Long propertyId);
}
