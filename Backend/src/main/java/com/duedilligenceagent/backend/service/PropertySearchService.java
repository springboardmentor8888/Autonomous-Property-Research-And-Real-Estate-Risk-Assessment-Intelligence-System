package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.Apify.ApifyPropertyListing;
import com.duedilligenceagent.backend.dto.Google.GoogleCandidate;
import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.dto.Property.PropertyListing;
import com.duedilligenceagent.backend.dto.Property.PropertySearchApiResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse.ListingsStatus;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse.ResolvedPlace;
import com.duedilligenceagent.backend.entities.ComparablePropertyDetails;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.repositories.ComparablePropertyDetailsRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.services.AddressValidationStrategy;
import com.duedilligenceagent.backend.services.ApifyClient;
import com.duedilligenceagent.backend.services.ApifyPropertyMapper;
import com.duedilligenceagent.backend.services.GooglePlacesDetailsService;
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

/**
 * Orchestrates the property search pipeline:
 * <ol>
 *   <li>structured address input → Google Address Validation
 *       (validated/normalized address + location),</li>
 *   <li>persist the initial property details,</li>
 *   <li>Apify 99acres property search using the resolved address/location,</li>
 *   <li>map the listing data into the internal model,</li>
 *   <li>enrich the property_details row with the best match and persist every
 *       listing as a market comparable,</li>
 *   <li>return the property search result.</li>
 * </ol>
 * <p>
 * A listing-provider failure never fails the search — the validated address
 * result is returned with {@code listingsStatus=UNAVAILABLE}.
 * <p>
 * Kept separate from {@link PropertyService} (DB-backed CRUD) to keep
 * the search/orchestration concern out of the entity layer.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PropertySearchService {

    private final AddressValidationStrategy addressValidationStrategy;
    private final PropertyRepository propertyRepository;
    private final ComparablePropertyDetailsRepository comparableRepository;
    private final GooglePlacesDetailsService placesDetailsService;
    private final ApifyClient apifyClient;
    private final ApifyPropertyMapper apifyPropertyMapper;

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
        log.info("Validating address via {}: '{}'", addressValidationStrategy.getStrategyName(), fullAddress);

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

        // --- 2. Persist the initial property details ---
        Property saved = persist(bestCandidate, fullAddress, request, searchedByUserId);
        log.info("{} resolved '{}' to candidate; persisted Property row with id={}",
                addressValidationStrategy.getStrategyName(), fullAddress, saved.getPropertyId());

        // --- 3-5. Apify property search using the resolved address/location ---
        List<PropertyListing> listings = null;
        ListingsStatus listingsStatus = ListingsStatus.UNAVAILABLE;
        String listingsMessage = null;

        if (apifyClient.isEnabled()) {
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
