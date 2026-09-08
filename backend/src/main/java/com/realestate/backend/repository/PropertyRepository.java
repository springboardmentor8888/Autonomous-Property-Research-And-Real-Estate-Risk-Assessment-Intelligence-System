package com.realestate.backend.repository;

import com.realestate.backend.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByCityIgnoreCase(String city);

    List<Property> findByZipCode(String zipCode);

    List<Property> findByPropertyTypeIgnoreCase(String propertyType);

    List<Property> findByStatusIgnoreCase(String status);

    @Query("SELECT p FROM Property p WHERE " +
           "(:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.address) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.city) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:city IS NULL OR LOWER(p.city) = LOWER(:city)) AND " +
           "(:state IS NULL OR LOWER(p.state) = LOWER(:state)) AND " +
           "(:zipCode IS NULL OR p.zipCode = :zipCode) AND " +
           "(:propertyType IS NULL OR LOWER(p.propertyType) = LOWER(:propertyType)) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minBedrooms IS NULL OR p.bedrooms >= :minBedrooms) AND " +
           "(:minBathrooms IS NULL OR p.bathrooms >= :minBathrooms) AND " +
           "(:status IS NULL OR LOWER(p.status) = LOWER(:status))")
    List<Property> searchProperties(
            @Param("query") String query,
            @Param("city") String city,
            @Param("state") String state,
            @Param("zipCode") String zipCode,
            @Param("propertyType") String propertyType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minBedrooms") Integer minBedrooms,
            @Param("minBathrooms") Integer minBathrooms,
            @Param("status") String status
    );
}
