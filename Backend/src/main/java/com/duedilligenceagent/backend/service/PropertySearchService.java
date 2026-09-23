package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.Google.GoogleCandidate;
import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.dto.Property.PropertySearchApiResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse.ResolvedPlace;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.services.AddressValidationStrategy;
import com.duedilligenceagent.backend.services.GooglePlacesDetailsService;
import com.duedilligenceagent.backend.services.PropertyTypeClassifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

/**
 * Orchestrates the property address search pipeline using Google Maps APIs.
 * <p>
 * Uses a configurable {@link AddressValidationStrategy} to validate/geocode addresses.
 * Currently configured to use ONLY Google Geocoding API for address validation.
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
    private final GooglePlacesDetailsService placesDetailsService;

    @Transactional
    public PropertySearchApiResponse searchByAddress(PropertyDetailsRequest request) {
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

        // Construct full address from structured input
        final String fullAddress = buildFullAddress(request);
        log.info("Validating address via {}: '{}'", addressValidationStrategy.getStrategyName(), fullAddress);

        // Primary: Configured Address Validation Strategy (Google Geocoding API)
        List<GoogleCandidate> candidates;
        try {
            candidates = addressValidationStrategy.validate(fullAddress);
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
            log.info("{} returned no candidates for address='{}' (ZERO_RESULTS)",
                    addressValidationStrategy.getStrategyName(), fullAddress);
            return PropertySearchApiResponse.builder()
                    .success(false)
                    .message("Invalid address. Could not resolve '" + fullAddress + "'.")
                    .data(PropertySearchResponse.builder()
                            .status(PropertySearchResponse.Status.INVALID)
                            .message("Invalid address. Could not resolve the provided address.")
                            .requestedAddress(fullAddress)
                            .results(Collections.emptyList())
                            .build())
                    .build();
        }

        // Take the first (best) candidate
        GoogleCandidate bestCandidate = candidates.get(0);

        // Geocoding match-types could not classify it — ask Places API (New)
        // for Google's own classification of the same place resource.
        if (bestCandidate.getPropertyType() == null) {
            enrichPropertyTypeFromPlaces(bestCandidate);
        }

        // Persist the best candidate (rely solely on geocoding API for all property data)
        Property saved = persist(bestCandidate, fullAddress, request);

        final ResolvedPlace place = ResolvedPlace.builder()
                .propertyId(saved.getPropertyId())
                .placeId(bestCandidate.getPlaceId())
                .formattedAddress(bestCandidate.getFormattedAddress())
                .latitude(bestCandidate.getLatitude())
                .longitude(bestCandidate.getLongitude())
                .city(bestCandidate.getCity())
                .state(bestCandidate.getState())
                .pincode(bestCandidate.getPostalCode())
                .build();

        log.info("{} resolved '{}' to candidate; persisted Property row with id={}",
                addressValidationStrategy.getStrategyName(), fullAddress, saved.getPropertyId());

        return PropertySearchApiResponse.builder()
                .success(true)
                .message("Address validated successfully.")
                .data(PropertySearchResponse.builder()
                        .status(PropertySearchResponse.Status.VALID)
                        .message("Address validated successfully.")
                        .requestedAddress(fullAddress)
                        .results(List.of(place))
                        .build())
                .build();
    }

    /**
     * Constructs a full address string from structured input fields.
     * Order: houseFlatPlot, buildingSociety, streetRoad, address, locality, city, district, state, pincode
     */
    private String buildFullAddress(PropertyDetailsRequest request) {
        StringBuilder sb = new StringBuilder();
        
        // Primary address line (most specific)
        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            sb.append(request.getAddress().trim());
        }
        
        // House/Flat/Plot number
        if (request.getHouseFlatPlot() != null && !request.getHouseFlatPlot().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(request.getHouseFlatPlot().trim());
        }
        
        // Building/Society
        if (request.getBuildingSociety() != null && !request.getBuildingSociety().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(request.getBuildingSociety().trim());
        }
        
        // Street/Road
        if (request.getStreetRoad() != null && !request.getStreetRoad().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(request.getStreetRoad().trim());
        }
        
        // Locality
        if (request.getLocality() != null && !request.getLocality().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(request.getLocality().trim());
        }
        
        // City (required)
        if (request.getCity() != null && !request.getCity().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(request.getCity().trim());
        }
        
        // District
        if (request.getDistrict() != null && !request.getDistrict().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(request.getDistrict().trim());
        }
        
        // State (required)
        if (request.getState() != null && !request.getState().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(request.getState().trim());
        }
        
        // PIN code
        if (request.getPincode() != null && !request.getPincode().isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(request.getPincode().trim());
        }
        
        return sb.toString();
    }

    private Property persist(GoogleCandidate c, String requestedAddress, PropertyDetailsRequest request) {
        Property row = Property.builder()
                .address(c.getFormattedAddress() != null ? c.getFormattedAddress() : requestedAddress)
                .city(c.getCity() != null ? c.getCity() : request.getCity())
                .state(c.getState() != null ? c.getState() : request.getState())
                .postalCode(c.getPostalCode() != null ? c.getPostalCode() : request.getPincode())
                .latitude(toBigDecimal(c.getLatitude()))
                .longitude(toBigDecimal(c.getLongitude()))
                .propertyType(PropertyTypeClassifier.normalize(c.getPropertyType()))
                .build();
        return propertyRepository.save(row);
    }

    private static BigDecimal toBigDecimal(Double v) {
        return v == null ? null : BigDecimal.valueOf(v);
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
