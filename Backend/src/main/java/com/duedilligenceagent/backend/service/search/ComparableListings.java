package com.duedilligenceagent.backend.service.search;

import com.duedilligenceagent.backend.dto.Property.PropertyListing;
import com.duedilligenceagent.backend.entities.ComparablePropertyDetails;
import com.duedilligenceagent.backend.repositories.ComparablePropertyDetailsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

/**
 * Maps a property's stored comparables (seed dataset or previously fetched
 * external listings) into search-response listings. Shared by both search
 * paths so a stored comparable is always served in the same shape.
 */
@Component
@RequiredArgsConstructor
class ComparableListings {

    private final ComparablePropertyDetailsRepository comparableRepository;

    /** The property's stored comparables as search-response listings. */
    List<PropertyListing> forProperty(Long propertyId) {
        return comparableRepository.findByPropertyId(propertyId).stream()
                .map(this::toListing)
                .filter(Objects::nonNull)
                .toList();
    }

    private PropertyListing toListing(ComparablePropertyDetails comparable) {
        return PropertyListing.builder()
                .listingId(comparable.getExternalListingId())
                .propertyType(comparable.getPropertyType())
                .bhk(comparable.getBhk())
                .areaText(comparable.getAreaSqft() == null ? null : comparable.getAreaSqft() + " sqft")
                .price(comparable.getPrice() == null ? null : comparable.getPrice().toPlainString())
                .pricePerSqft(comparable.getPricePerSqft() == null
                        ? null : comparable.getPricePerSqft().toPlainString())
                .reraId(comparable.getReraId())
                .verified(comparable.getVerified())
                .locality(comparable.getLocality())
                .city(comparable.getCity())
                .source(comparable.getSource())
                .build();
    }
}
