package com.duedilligenceagent.backend.service.search;

import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.dto.Property.PropertyListing;
import com.duedilligenceagent.backend.dto.Property.PropertySearchApiResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse.ListingsStatus;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse.ResolvedPlace;
import com.duedilligenceagent.backend.entities.Property;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * <b>Seeded dataset path</b> of the property search: matches the structured
 * input against the stored due-diligence dataset (the 50 seeded properties
 * that carry full diligence records) and serves the stored property with
 * its dataset comparables — <b>no external API calls</b>. Data is fetched
 * once and reused for every user.
 * <p>
 * The external Google/Apify pipeline is the fallback for anything this
 * dataset does not cover — see {@link ExternalPropertySearchService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
class DatasetPropertySearchService {

    private final PropertyMatchService propertyMatchService;
    private final ComparableListings comparableListings;

    /** Dataset match for the search input, if any. */
    Optional<SearchOutcome> find(PropertyDetailsRequest request, String requestedAddress) {
        return propertyMatchService.findMatch(request)
                .map(property -> matched(property, requestedAddress));
    }

    private SearchOutcome matched(Property property, String requestedAddress) {
        log.info("Search input matched due-diligence dataset property id={}", property.getPropertyId());

        List<PropertyListing> listings = comparableListings.forProperty(property.getPropertyId());

        ResolvedPlace place = ResolvedPlace.builder()
                .propertyId(property.getPropertyId())
                .formattedAddress(property.getAddress())
                .latitude(toDouble(property.getLatitude()))
                .longitude(toDouble(property.getLongitude()))
                .city(property.getCity())
                .state(property.getState())
                .pincode(property.getPostalCode())
                .locality(property.getLocality())
                .build();

        return new SearchOutcome(property, PropertySearchApiResponse.builder()
                .success(true)
                .message("Matched the due-diligence dataset.")
                .data(PropertySearchResponse.builder()
                        .status(PropertySearchResponse.Status.VALID)
                        .message("Matched the due-diligence dataset.")
                        .requestedAddress(requestedAddress)
                        .results(List.of(place))
                        .listingsStatus(listings.isEmpty() ? ListingsStatus.NO_RESULTS : ListingsStatus.FOUND)
                        .listingsMessage(listings.isEmpty()
                                ? "No comparables stored for this property."
                                : "Comparables from the due-diligence dataset.")
                        .listings(listings)
                        .build())
                .build());
    }

    private static Double toDouble(BigDecimal value) {
        return value == null ? null : value.doubleValue();
    }
}
