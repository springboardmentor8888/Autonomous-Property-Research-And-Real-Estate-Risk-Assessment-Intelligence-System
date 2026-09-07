package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.Mappls.MapplsGeocodeResponse;
import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.dto.Property.PropertySearchApiResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse.ResolvedPlace;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.services.MapplsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

/**
 * Orchestrates the property address search pipeline.
 * <p>
 * <ol>
 *   <li>Validates the request body carries a non-blank address.</li>
 *   <li>Forwards the address to {@link MapplsService} for resolution.</li>
 *   <li>Persists each resolved candidate as a {@link Property} row so the
 *       frontend can navigate to {@code /property-details?propertyId=...}.</li>
 *   <li>Translates the Mappls response into a {@link PropertySearchResponse}
 *       with one of three states: {@code VALID}, {@code INVALID},
 *       {@code ERROR}.</li>
 *   <li>Wraps the result in {@link PropertySearchApiResponse} so the
 *       controller always has a top-level {@code message} string for
 *       frontend toast handling.</li>
 * </ol>
 * Kept separate from {@link PropertyService} (DB-backed CRUD) to keep
 * the search/orchestration concern out of the entity layer.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PropertySearchService {

    private final MapplsService mapplsService;
    private final PropertyRepository propertyRepository;

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
        log.info("Validating address via Mappls: '{}'", requestedAddress);

        final List<MapplsGeocodeResponse.Candidate> candidates = mapplsService.geocode(requestedAddress);

        if (candidates.isEmpty()) {
            log.info("Mappls returned no candidates for address='{}'", requestedAddress);
            return PropertySearchApiResponse.builder()
                    .success(false)
                    .message("Invalid address. Mappls could not resolve '" + requestedAddress + "'.")
                    .data(PropertySearchResponse.builder()
                            .status(PropertySearchResponse.Status.INVALID)
                            .message("Invalid address. Mappls could not resolve the provided address.")
                            .requestedAddress(requestedAddress)
                            .results(Collections.emptyList())
                            .build())
                    .build();
        }

        final List<ResolvedPlace> places = candidates.stream()
                .map(c -> {
                    Property saved = persist(c, requestedAddress);
                    return ResolvedPlace.builder()
                            .propertyId(saved.getPropertyId())
                            .placeId(c.getPlaceId())
                            .formattedAddress(c.getFormattedAddress())
                            .latitude(c.getLatitude())
                            .longitude(c.getLongitude())
                            .city(c.getCity())
                            .state(c.getState())
                            .pincode(c.getPincode())
                            .build();
                })
                .toList();

        log.info("Mappls resolved '{}' to {} candidate(s); persisted {} Property row(s)",
                requestedAddress, places.size(), places.size());

        return PropertySearchApiResponse.builder()
                .success(true)
                .message("Address validated successfully. " + places.size() + " candidate(s) found.")
                .data(PropertySearchResponse.builder()
                        .status(PropertySearchResponse.Status.VALID)
                        .message("Address validated successfully.")
                        .requestedAddress(requestedAddress)
                        .results(places)
                        .build())
                .build();
    }

    private Property persist(MapplsGeocodeResponse.Candidate c, String requestedAddress) {
        Property row = Property.builder()
                .address(c.getFormattedAddress() != null ? c.getFormattedAddress() : requestedAddress)
                .city(c.getCity())
                .state(c.getState())
                .postalCode(c.getPincode())
                .latitude(toBigDecimal(c.getLatitude()))
                .longitude(toBigDecimal(c.getLongitude()))
                .build();
        return propertyRepository.save(row);
    }

    private static BigDecimal toBigDecimal(Double v) {
        return v == null ? null : BigDecimal.valueOf(v);
    }
}
