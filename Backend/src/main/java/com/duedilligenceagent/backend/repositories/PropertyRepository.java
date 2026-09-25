package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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

    /** Exact place dedup for the external search path (fetch once, reuse). */
    Optional<Property> findByGooglePlaceId(String googlePlaceId);

    /**
     * Secondary dedup for the external search path: the same resolved
     * address in the same city. Google place ids are not always stable for
     * landmark-level addresses, so the resolved formatted address is the
     * stable identity of last resort.
     */
    Optional<Property> findFirstByAddressIgnoreCaseAndCityIgnoreCaseOrderByPropertyIdAsc(
            String address, String city);

    /**
     * Properties that carry diligence records — today the 50-property static
     * dataset. These are the match candidates for the seed-dataset search
     * path (no external API calls needed).
     */
    @Query("SELECT p FROM Property p WHERE p.propertyId IN "
            + "(SELECT o.propertyId FROM OwnershipDetails o) ORDER BY p.propertyId")
    List<Property> findPropertiesWithDiligenceRecords();
}
