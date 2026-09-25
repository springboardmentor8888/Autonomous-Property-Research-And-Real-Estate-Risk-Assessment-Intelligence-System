package com.duedilligenceagent.backend.service.search;

import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.dto.Property.PropertyListing;
import com.duedilligenceagent.backend.dto.Property.PropertySearchApiResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse.ListingsStatus;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse.ResolvedPlace;
import com.duedilligenceagent.backend.entities.ComparablePropertyDetails;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.integration.apify.ApifyClient;
import com.duedilligenceagent.backend.integration.apify.ApifyPropertyListing;
import com.duedilligenceagent.backend.integration.apify.ApifyPropertyMapper;
import com.duedilligenceagent.backend.integration.google.GoogleCandidate;
import com.duedilligenceagent.backend.integration.google.GooglePlacesDetailsService;
import com.duedilligenceagent.backend.integration.google.PropertyTypeClassifier;
import com.duedilligenceagent.backend.repositories.ComparablePropertyDetailsRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
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
 * <b>External fallback path</b> of the property search — used only when the
 * seeded due-diligence dataset has no match:
 * <ol>
 *   <li>Google Address Validation resolves the structured address,</li>
 *   <li>an existing property_details row for the same place — or, when
 *       Google's place id is unstable, for the same resolved address+city —
 *       is reused (fetch once, reuse for every later search),</li>
 *   <li>otherwise the validated address is persisted,</li>
 *   <li>the property is enriched with the best-matching Apify 99acres
 *       listing and every listing is stored as a market comparable.</li>
 * </ol>
 * A listing-provider failure never fails the search — the validated address
 * result is returned with {@code listingsStatus=UNAVAILABLE}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
class ExternalPropertySearchService {

    private final AddressValidationStrategy addressValidationStrategy;
    private final PropertyRepository propertyRepository;
    private final ComparablePropertyDetailsRepository comparableRepository;
    private final GooglePlacesDetailsService placesDetailsService;
    private final ApifyClient apifyClient;
    private final ApifyPropertyMapper apifyPropertyMapper;
    private final ComparableListings comparableListings;

    /** Runs the external pipeline for an input the dataset did not cover. */
    @Transactional
    SearchOutcome search(PropertyDetailsRequest request, String fullAddress, Long searchedByUserId) {
        // --- 1. Google Address Validation ---
        List<GoogleCandidate> candidates;
        try {
            candidates = addressValidationStrategy.validate(request);
        } catch (AddressValidationStrategy.AddressValidationException ex) {
            log.error("Address validation API error for address='{}': status={}, message={}",
                    fullAddress, ex.getApiStatus(), ex.getMessage());
            return SearchOutcome.failure(PropertySearchApiResponse.builder()
                    .success(false)
                    .message("Address validation service error: " + ex.getMessage())
                    .data(PropertySearchResponse.builder()
                            .status(PropertySearchResponse.Status.ERROR)
                            .message("Google API error: " + ex.getApiStatus())
                            .requestedAddress(fullAddress)
                            .results(Collections.emptyList())
                            .build())
                    .build());
        }

        if (candidates.isEmpty()) {
            log.info("{} could not validate address='{}'",
                    addressValidationStrategy.getStrategyName(), fullAddress);
            return SearchOutcome.failure(PropertySearchApiResponse.builder()
                    .success(false)
                    .message("Invalid address. Could not resolve '" + fullAddress + "'.")
                    .data(PropertySearchResponse.builder()
                            .status(PropertySearchResponse.Status.INVALID)
                            .message("Invalid address. Could not be validated.")
                            .requestedAddress(fullAddress)
                            .results(Collections.emptyList())
                            .build())
                    .build());
        }

        GoogleCandidate best = candidates.get(0);

        // Validation could not classify the property type — ask Places API (New)
        // for Google's own classification of the same place resource.
        if (best.getPropertyType() == null) {
            enrichPropertyTypeFromPlaces(best);
        }

        // --- 2. Dedup: place id first, then resolved address+city ---
        Property saved = resolveStoredProperty(best, fullAddress, request, searchedByUserId);

        // --- 3-5. Listing data: stored comparables on reuse, Apify otherwise ---
        ListingsOutcome listingsOutcome = resolveListings(saved, best, request);

        // --- 6. Build the response ---
        ResolvedPlace place = ResolvedPlace.builder()
                .propertyId(saved.getPropertyId())
                .placeId(best.getPlaceId())
                .formattedAddress(best.getFormattedAddress())
                .latitude(best.getLatitude())
                .longitude(best.getLongitude())
                .city(best.getCity())
                .state(best.getState())
                .pincode(best.getPostalCode())
                .locality(best.getLocality())
                .validationGranularity(best.getValidationGranularity())
                .geocodeGranularity(best.getGeocodeGranularity())
                .addressComplete(best.getAddressComplete())
                .hasUnconfirmedComponents(best.getHasUnconfirmedComponents())
                .possibleNextAction(best.getPossibleNextAction())
                .placeTypes(best.getPlaceTypes())
                .plusCode(best.getPlusCode())
                .build();

        return new SearchOutcome(saved, PropertySearchApiResponse.builder()
                .success(true)
                .message("Address validated successfully.")
                .data(PropertySearchResponse.builder()
                        .status(PropertySearchResponse.Status.VALID)
                        .message("Address validated successfully.")
                        .requestedAddress(fullAddress)
                        .results(List.of(place))
                        .listingsStatus(listingsOutcome.status())
                        .listingsMessage(listingsOutcome.message())
                        .listings(listingsOutcome.listings())
                        .build())
                .build());
    }

    /**
     * Finds the stored row for the resolved place: by Google place id, then
     * (place ids are not always stable for landmark-level addresses) by the
     * resolved address+city. Reuse keeps the freshest place id. Otherwise a
     * new row is persisted.
     */
    private Property resolveStoredProperty(GoogleCandidate best, String fullAddress,
                                           PropertyDetailsRequest request, Long searchedByUserId) {
        if (best.getPlaceId() != null) {
            Optional<Property> byPlace = propertyRepository.findByGooglePlaceId(best.getPlaceId());
            if (byPlace.isPresent()) {
                log.info("Reusing stored property id={} for place '{}' (skipping re-fetch)",
                        byPlace.get().getPropertyId(), best.getPlaceId());
                return byPlace.get();
            }
        }

        String resolvedCity = firstNonBlank(best.getCity(), request.getCity());
        String resolvedAddress = best.getFormattedAddress();
        if (resolvedAddress != null && resolvedCity != null) {
            Optional<Property> byAddress = propertyRepository
                    .findFirstByAddressIgnoreCaseAndCityIgnoreCaseOrderByPropertyIdAsc(
                            resolvedAddress, resolvedCity);
            if (byAddress.isPresent()) {
                Property existing = byAddress.get();
                if (best.getPlaceId() != null && !best.getPlaceId().equals(existing.getGooglePlaceId())) {
                    existing.setGooglePlaceId(best.getPlaceId());
                    propertyRepository.save(existing);
                    log.info("Reusing stored property id={} by resolved address; refreshed place id to '{}'",
                            existing.getPropertyId(), best.getPlaceId());
                } else {
                    log.info("Reusing stored property id={} by resolved address '{}'",
                            existing.getPropertyId(), resolvedAddress);
                }
                return existing;
            }
        }

        Property saved = persist(best, fullAddress, request, searchedByUserId);
        log.info("{} resolved '{}' to candidate; persisted Property row with id={}",
                addressValidationStrategy.getStrategyName(), fullAddress, saved.getPropertyId());
        return saved;
    }

    private record ListingsOutcome(ListingsStatus status, String message, List<PropertyListing> listings) {
    }

    /** Serves stored comparables when the property was already enriched; fetches Apify otherwise. */
    private ListingsOutcome resolveListings(Property property, GoogleCandidate best,
                                            PropertyDetailsRequest request) {
        if (property.getExternalListingId() != null) {
            List<PropertyListing> listings = comparableListings.forProperty(property.getPropertyId());
            if (listings.isEmpty()) {
                return new ListingsOutcome(ListingsStatus.NO_RESULTS,
                        "No property listings stored for this property yet.", listings);
            }
            return new ListingsOutcome(ListingsStatus.FOUND,
                    "Previously fetched property listings for this property.", listings);
        }

        if (!apifyClient.isEnabled()) {
            log.info("Apify token not configured — skipping listing enrichment for property id={}",
                    property.getPropertyId());
            return new ListingsOutcome(ListingsStatus.UNAVAILABLE,
                    "Property listing search is not configured (Apify API token missing).", null);
        }

        String searchCity = firstNonBlank(best.getCity(), request.getCity());
        String searchLocality = firstNonBlank(best.getLocality(), request.getLocality());
        try {
            List<ApifyPropertyListing> externalListings =
                    apifyClient.searchProperties(searchCity, searchLocality);
            if (externalListings.isEmpty()) {
                return new ListingsOutcome(ListingsStatus.NO_RESULTS,
                        "No property listings found for the resolved location.", List.of());
            }

            ApifyPropertyListing bestListing = pickBestMatch(externalListings, request);
            apifyPropertyMapper.enrichProperty(property, bestListing);
            Property enriched = propertyRepository.save(property);

            List<ComparablePropertyDetails> comparables = externalListings.stream()
                    .map(listing -> apifyPropertyMapper.toComparable(enriched, listing))
                    .filter(Objects::nonNull)
                    .toList();
            comparableRepository.saveAll(comparables);

            List<PropertyListing> listings = externalListings.stream()
                    .map(apifyPropertyMapper::toListing)
                    .filter(Objects::nonNull)
                    .toList();
            log.info("Enriched property id={} with listing '{}' ({} of {} listings persisted as comparables)",
                    enriched.getPropertyId(), bestListing.getListingId(),
                    comparables.size(), externalListings.size());
            return new ListingsOutcome(ListingsStatus.FOUND, null, listings);
        } catch (RestClientException ex) {
            log.warn("Apify listing search failed for property id={}: {}",
                    property.getPropertyId(), ex.getMessage());
            return new ListingsOutcome(ListingsStatus.UNAVAILABLE,
                    "Property listing search is currently unavailable.", null);
        }
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

    private static boolean containsIgnoreCase(String haystack, String needle) {
        return haystack != null && haystack.toLowerCase(Locale.ROOT).contains(needle);
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
}
