package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.Apify.ApifyPropertyListing;
import com.duedilligenceagent.backend.dto.Google.GoogleCandidate;
import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.dto.Property.PropertyListing;
import com.duedilligenceagent.backend.dto.Property.PropertySearchApiResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse.ListingsStatus;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse.ResolvedPlace;
import com.duedilligenceagent.backend.entities.ActivityLog;
import com.duedilligenceagent.backend.entities.ComparablePropertyDetails;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.repositories.ActivityLogRepository;
import com.duedilligenceagent.backend.repositories.ComparablePropertyDetailsRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.services.AddressValidationStrategy;
import com.duedilligenceagent.backend.services.ApifyClient;
import com.duedilligenceagent.backend.services.ApifyPropertyMapper;
import com.duedilligenceagent.backend.services.GooglePlacesDetailsService;
import com.duedilligenceagent.backend.services.PropertyMatchService;
import com.duedilligenceagent.backend.services.PropertyTypeClassifier;
import com.duedilligenceagent.backend.services.StructuredAddressText;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

/**
 * Orchestrates the property search:
 * <ol>
 *   <li><b>Due-diligence dataset match</b> — the structured input is matched
 *       against the stored dataset (the 50 seeded properties with full
 *       diligence records). On a match the stored property is returned
 *       directly with its dataset comparables — <b>no external API
 *       calls</b>. Data is fetched once and reused for every user.</li>
 *   <li><b>External pipeline</b> (side-plugin for future milestones) —
 *       Google Address Validation resolves the address, an existing
 *       property_details row for the same place is reused (fetch once),
 *       otherwise the validated address is persisted, enriched with the
 *       best-matching Apify 99acres listing and every listing is stored as
 *       a market comparable.</li>
 * </ol>
 * Every successful search — dataset match or external — records a
 * {@code PROPERTY_SEARCHED} activity event for the user, which drives
 * their search history.
 * <p>
 * A listing-provider failure never fails the search — the validated address
 * result is returned with {@code listingsStatus=UNAVAILABLE}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PropertySearchService {

    static final String SEARCH_EVENT_ACTION = "PROPERTY_SEARCHED";

    private final AddressValidationStrategy addressValidationStrategy;
    private final PropertyRepository propertyRepository;
    private final ComparablePropertyDetailsRepository comparableRepository;
    private final GooglePlacesDetailsService placesDetailsService;
    private final ApifyClient apifyClient;
    private final ApifyPropertyMapper apifyPropertyMapper;
    private final PropertyMatchService propertyMatchService;
    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public PropertySearchApiResponse searchByAddress(PropertyDetailsRequest request, Long searchedByUserId) {
        if (request == null || request.getAddress() == null || request.getAddress().isBlank()) {
            return PropertySearchApiResponse.builder()
                    .success(false)
                    .message("Address is required and must not be blank.")
                    .data(PropertySearchResponse.builder()
                            .status(PropertySearchResponse.Status.INVALID)
                            .message("address must not be blank")
                            .requestedAddress(request != null ? request.getAddress() : null)
                            .results(Collections.emptyList())
                            .build())
                    .build();
        }

        final String fullAddress = StructuredAddressText.fullAddress(request);

        // --- 0. Due-diligence dataset match: stored data, no external calls ---
        Optional<Property> datasetMatch = propertyMatchService.findMatch(request);
        if (datasetMatch.isPresent()) {
            return datasetMatchResponse(datasetMatch.get(), fullAddress, searchedByUserId);
        }

        log.info("No dataset match for '{}' — falling back to {} validation",
                fullAddress, addressValidationStrategy.getStrategyName());

        // --- 1. Google Address Validation ---
        List<GoogleCandidate> candidates;
        try {
            candidates = addressValidationStrategy.validate(request);
        } catch (AddressValidationStrategy.AddressValidationException ex) {
            log.error("Address validation API error for address='{}': status={}, message={}",
                    fullAddress, ex.getApiStatus(), ex.getMessage());
            return PropertySearchApiResponse.builder()
                    .success(false)
                    .message("Address validation service error: " + ex.getMessage())
                    .data(PropertySearchResponse.builder()
                            .status(PropertySearchResponse.Status.ERROR)
                            .message("Google API error: " + ex.getApiStatus())
                            .requestedAddress(fullAddress)
                            .results(Collections.emptyList())
                            .build())
                    .build();
        }

        if (candidates.isEmpty()) {
            log.info("{} could not validate address='{}'",
                    addressValidationStrategy.getStrategyName(), fullAddress);
            return PropertySearchApiResponse.builder()
                    .success(false)
                    .message("Invalid address. Could not resolve '" + fullAddress + "'.")
                    .data(PropertySearchResponse.builder()
                            .status(PropertySearchResponse.Status.INVALID)
                            .message("Invalid address. Could not be validated.")
                            .requestedAddress(fullAddress)
                            .results(Collections.emptyList())
                            .build())
                    .build();
        }

        // Take the first (best) candidate
        GoogleCandidate bestCandidate = candidates.get(0);

        // Validation types could not classify it — ask Places API (New)
        // for Google's own classification of the same place resource.
        if (bestCandidate.getPropertyType() == null) {
            enrichPropertyTypeFromPlaces(bestCandidate);
        }

        // --- 2. Dedup by place id: fetch once, reuse for every later search ---
        Property saved;
        boolean reused;
        if (bestCandidate.getPlaceId() != null) {
            Optional<Property> existing =
                    propertyRepository.findByGooglePlaceId(bestCandidate.getPlaceId());
            if (existing.isPresent()) {
                saved = existing.get();
                reused = true;
                log.info("Reusing stored property id={} for place '{}' (skipping re-fetch)",
                        saved.getPropertyId(), bestCandidate.getPlaceId());
            } else {
                saved = persist(bestCandidate, fullAddress, request, searchedByUserId);
                reused = false;
                log.info("{} resolved '{}' to candidate; persisted Property row with id={}",
                        addressValidationStrategy.getStrategyName(), fullAddress, saved.getPropertyId());
            }
        } else {
            saved = persist(bestCandidate, fullAddress, request, searchedByUserId);
            reused = false;
        }

        logSearchEvent(searchedByUserId, saved.getPropertyId());

        // --- 3-5. Listing data: stored comparables on reuse, Apify otherwise ---
        List<PropertyListing> listings = null;
        ListingsStatus listingsStatus = ListingsStatus.UNAVAILABLE;
        String listingsMessage = null;

        if (reused && saved.getExternalListingId() != null) {
            // Previously fetched — serve the stored comparables.
            listings = storedListings(saved);
            if (listings.isEmpty()) {
                listingsStatus = ListingsStatus.NO_RESULTS;
                listingsMessage = "No property listings stored for this property yet.";
            } else {
                listingsStatus = ListingsStatus.FOUND;
                listingsMessage = "Previously fetched property listings for this property.";
            }
        } else if (apifyClient.isEnabled()) {
            String searchCity = firstNonBlank(bestCandidate.getCity(), request.getCity());
            String searchLocality = firstNonBlank(bestCandidate.getLocality(), request.getLocality());
            try {
                List<ApifyPropertyListing> externalListings =
                        apifyClient.searchProperties(searchCity, searchLocality);
                if (externalListings.isEmpty()) {
                    listingsStatus = ListingsStatus.NO_RESULTS;
                    listings = List.of();
                    listingsMessage = "No property listings found for the resolved location.";
                } else {
                    ApifyPropertyListing bestListing = pickBestMatch(externalListings, request);
                    apifyPropertyMapper.enrichProperty(saved, bestListing);
                    Property enriched = propertyRepository.save(saved);

                    List<ComparablePropertyDetails> comparables = externalListings.stream()
                            .map(listing -> apifyPropertyMapper.toComparable(enriched, listing))
                            .filter(Objects::nonNull)
                            .toList();
                    comparableRepository.saveAll(comparables);

                    listings = externalListings.stream()
                            .map(apifyPropertyMapper::toListing)
                            .filter(Objects::nonNull)
                            .toList();
                    listingsStatus = ListingsStatus.FOUND;
                    log.info("Enriched property id={} with listing '{}' ({} of {} listings persisted as comparables)",
                            enriched.getPropertyId(), bestListing.getListingId(),
                            comparables.size(), externalListings.size());
                }
            } catch (RestClientException ex) {
                log.warn("Apify listing search failed for property id={}: {}",
                        saved.getPropertyId(), ex.getMessage());
                listingsStatus = ListingsStatus.UNAVAILABLE;
                listingsMessage = "Property listing search is currently unavailable.";
            }
        } else {
            listingsMessage = "Property listing search is not configured (Apify API token missing).";
            log.info("Apify token not configured — skipping listing enrichment for property id={}",
                    saved.getPropertyId());
        }

        // --- 6. Build the response ---
        final ResolvedPlace place = ResolvedPlace.builder()
                .propertyId(saved.getPropertyId())
                .placeId(bestCandidate.getPlaceId())
                .formattedAddress(bestCandidate.getFormattedAddress())
                .latitude(bestCandidate.getLatitude())
                .longitude(bestCandidate.getLongitude())
                .city(bestCandidate.getCity())
                .state(bestCandidate.getState())
                .pincode(bestCandidate.getPostalCode())
                .locality(bestCandidate.getLocality())
                .validationGranularity(bestCandidate.getValidationGranularity())
                .geocodeGranularity(bestCandidate.getGeocodeGranularity())
                .addressComplete(bestCandidate.getAddressComplete())
                .hasUnconfirmedComponents(bestCandidate.getHasUnconfirmedComponents())
                .possibleNextAction(bestCandidate.getPossibleNextAction())
                .placeTypes(bestCandidate.getPlaceTypes())
                .plusCode(bestCandidate.getPlusCode())
                .build();

        return PropertySearchApiResponse.builder()
                .success(true)
                .message("Address validated successfully.")
                .data(PropertySearchResponse.builder()
                        .status(PropertySearchResponse.Status.VALID)
                        .message("Address validated successfully.")
                        .requestedAddress(fullAddress)
                        .results(List.of(place))
                        .listingsStatus(listingsStatus)
                        .listingsMessage(listingsMessage)
                        .listings(listings)
                        .build())
                .build();
    }

    /** Response for a due-diligence dataset match: stored property + comparables. */
    private PropertySearchApiResponse datasetMatchResponse(Property property, String requestedAddress,
                                                            Long searchedByUserId) {
        logSearchEvent(searchedByUserId, property.getPropertyId());

        List<PropertyListing> listings = storedListings(property);

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

        return PropertySearchApiResponse.builder()
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
                .build();
    }

    /** Maps the property's stored comparables into search-response listings. */
    private List<PropertyListing> storedListings(Property property) {
        return comparableRepository.findByPropertyId(property.getPropertyId()).stream()
                .map(this::comparableToListing)
                .filter(Objects::nonNull)
                .toList();
    }

    private PropertyListing comparableToListing(ComparablePropertyDetails comparable) {
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

    /** Records the user's search event — the basis of the search history. */
    private void logSearchEvent(Long userId, Long propertyId) {
        if (userId == null) {
            return;
        }
        activityLogRepository.save(ActivityLog.builder()
                .userId(userId)
                .action(SEARCH_EVENT_ACTION)
                .entityType("PROPERTY")
                .entityId(propertyId)
                .build());
    }

    /**
     * Picks the listing that best matches the searched property: when the user
     * supplied a building/society name, the first listing whose project,
     * building or title mentions it wins; otherwise the first listing.
     */
    private ApifyPropertyListing pickBestMatch(List<ApifyPropertyListing> listings,
                                               PropertyDetailsRequest request) {
        String society = request.getBuildingSociety();
        if (society != null && !society.isBlank()) {
            String needle = society.trim().toLowerCase(Locale.ROOT);
            for (ApifyPropertyListing listing : listings) {
                if (containsIgnoreCase(listing.getProjectName(), needle)
                        || containsIgnoreCase(listing.getBuildingName(), needle)
                        || containsIgnoreCase(listing.getTitle(), needle)) {
                    return listing;
                }
            }
        }
        return listings.get(0);
    }

    private static boolean containsIgnoreCase(String haystack, String needle) {
        return haystack != null && haystack.toLowerCase(Locale.ROOT).contains(needle);
    }

    private Property persist(GoogleCandidate c, String requestedAddress, PropertyDetailsRequest request,
                              Long searchedByUserId) {
        Property row = Property.builder()
                .address(c.getFormattedAddress() != null ? c.getFormattedAddress() : requestedAddress)
                .city(c.getCity() != null ? c.getCity() : request.getCity())
                .state(c.getState() != null ? c.getState() : request.getState())
                .postalCode(c.getPostalCode() != null ? c.getPostalCode() : request.getPincode())
                .locality(c.getLocality() != null ? c.getLocality() : request.getLocality())
                .latitude(toBigDecimal(c.getLatitude()))
                .longitude(toBigDecimal(c.getLongitude()))
                .propertyType(PropertyTypeClassifier.normalize(c.getPropertyType()))
                .googlePlaceId(c.getPlaceId())
                .validationGranularity(c.getValidationGranularity())
                .geocodeGranularity(c.getGeocodeGranularity())
                .addressComplete(c.getAddressComplete())
                .hasUnconfirmedComponents(c.getHasUnconfirmedComponents())
                .possibleNextAction(c.getPossibleNextAction())
                .placeTypes(join(c.getPlaceTypes()))
                .plusCode(c.getPlusCode())
                .googleResponseId(c.getResponseId())
                .searchedBy(searchedByUserId)
                .build();
        return propertyRepository.save(row);
    }

    private static Double toDouble(BigDecimal value) {
        return value == null ? null : value.doubleValue();
    }

    private static BigDecimal toBigDecimal(Double v) {
        return v == null ? null : BigDecimal.valueOf(v);
    }

    private static String join(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return String.join(",", values);
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v.trim();
            }
        }
        return null;
    }

    /**
     * Fallback classifier: resolves the geocoded place via Places API (New)
     * and maps Google's {@code primaryType}/{@code types} onto our
     * {@link com.duedilligenceagent.backend.entities.enums.PropertyType}.
     * Never throws — an unresolvable type simply stays null.
     */
    private void enrichPropertyTypeFromPlaces(GoogleCandidate candidate) {
        placesDetailsService.fetchDetails(candidate.getPlaceId()).ifPresent(details -> {
            String type = PropertyTypeClassifier.fromPlaces(details.getPrimaryType(), details.getTypes());
            if (type != null) {
                candidate.setPropertyType(type);
                log.info("Places enrichment classified '{}' as '{}' (primaryType={})",
                        candidate.getFormattedAddress(), type, details.getPrimaryType());
            } else {
                log.debug("Places enrichment had no mapping for primaryType={} of '{}'",
                        details.getPrimaryType(), candidate.getPlaceId());
            }
        });
    }
}
