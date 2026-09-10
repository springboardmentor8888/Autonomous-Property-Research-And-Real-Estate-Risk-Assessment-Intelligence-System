package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.Google.GoogleCandidate;
import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.dto.Property.PropertySearchApiResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse.ResolvedPlace;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.services.AddressValidationStrategy;
import com.duedilligenceagent.backend.services.PropertyTypeClassifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${google.address-validation.strategy:geocoding}")
    private String activeStrategy;

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

        final String requestedAddress = request.getAddress().trim();
        log.info("Validating address via {}: '{}'", addressValidationStrategy.getStrategyName(), requestedAddress);

        // Primary: Configured Address Validation Strategy (Google Geocoding API)
        List<GoogleCandidate> candidates;
        try {
            candidates = addressValidationStrategy.validate(requestedAddress);
        } catch (AddressValidationStrategy.AddressValidationException ex) {
            log.error("Address validation API error for address='{}': status={}, message={}",
                    requestedAddress, ex.getApiStatus(), ex.getMessage());
            return PropertySearchApiResponse.builder()
                    .success(false)
                    .message("Address validation service error: " + ex.getMessage())
                    .data(PropertySearchResponse.builder()
                            .status(PropertySearchResponse.Status.ERROR)
                            .message("Google API error: " + ex.getApiStatus())
                            .requestedAddress(requestedAddress)
                            .results(Collections.emptyList())
                            .build())
                    .build();
        }

        if (candidates.isEmpty()) {
            log.info("{} returned no candidates for address='{}' (ZERO_RESULTS)",
                    addressValidationStrategy.getStrategyName(), requestedAddress);
            return PropertySearchApiResponse.builder()
                    .success(false)
                    .message("Invalid address. Could not resolve '" + requestedAddress + "'.")
                    .data(PropertySearchResponse.builder()
                            .status(PropertySearchResponse.Status.INVALID)
                            .message("Invalid address. Could not resolve the provided address.")
                            .requestedAddress(requestedAddress)
                            .results(Collections.emptyList())
                            .build())
                    .build();
        }

        // Take the first (best) candidate
        GoogleCandidate bestCandidate = candidates.get(0);

        // Persist the best candidate (rely solely on geocoding API for all property data)
        Property saved = persist(bestCandidate, requestedAddress);

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
                addressValidationStrategy.getStrategyName(), requestedAddress, saved.getPropertyId());

        return PropertySearchApiResponse.builder()
                .success(true)
                .message("Address validated successfully.")
                .data(PropertySearchResponse.builder()
                        .status(PropertySearchResponse.Status.VALID)
                        .message("Address validated successfully.")
                        .requestedAddress(requestedAddress)
                        .results(List.of(place))
                        .build())
                .build();
    }

    private Property persist(GoogleCandidate c, String requestedAddress) {
        Property row = Property.builder()
                .address(c.getFormattedAddress() != null ? c.getFormattedAddress() : requestedAddress)
                .city(c.getCity())
                .state(c.getState())
                .postalCode(c.getPostalCode())
                .latitude(toBigDecimal(c.getLatitude()))
                .longitude(toBigDecimal(c.getLongitude()))
                .propertyType(PropertyTypeClassifier.normalize(c.getPropertyType()))
                .build();
        return propertyRepository.save(row);
    }

    private static BigDecimal toBigDecimal(Double v) {
        return v == null ? null : BigDecimal.valueOf(v);
    }
}
