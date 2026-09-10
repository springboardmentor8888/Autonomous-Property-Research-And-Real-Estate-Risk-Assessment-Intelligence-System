package com.duedilligenceagent.backend.services;

import com.duedilligenceagent.backend.dto.Google.GoogleCandidate;
import com.duedilligenceagent.backend.dto.Google.GooglePlacesResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Collections;
import java.util.List;

/**
 * Thin wrapper around the Google Places API (New) Text Search.
 * <p>
 * Uses the auto-configured {@link RestClient.Builder} provided by Spring
 * Boot. The base URL is read from {@code application.properties}; the API key
 * is loaded from the {@code GOOGLE_GEOCODING_API_KEY} environment variable.
 * <p>
 * Endpoint: {@code POST /v1/places:searchText}
 * on {@code places.googleapis.com}.
 * <p>
 * Requires FieldMask header to specify which fields to return.
 * Returns empty list on ZERO_RESULTS; throws {@link GoogleApiException} on API errors.
 * <p>
 * <b>NOTE:</b> This service is currently disabled in favor of Google Geocoding API only.
 * Remove @Service annotation to prevent auto-instantiation.
 */
@Slf4j
public class GooglePlacesService {

    private final RestClient placesRestClient;
    private final String apiKey;

    public GooglePlacesService(
            RestClient.Builder restClientBuilder,
            @Value("${google.places.base-url}") String placesBaseUrl,
            @Value("${google.places.api-key}") String apiKey) {
        this.placesRestClient = restClientBuilder
                .baseUrl(placesBaseUrl)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("X-Goog-Api-Key", apiKey)
                .defaultHeader("X-Goog-FieldMask", "places.id,places.displayName,places.formattedAddress,places.location,places.addressComponents,places.types,places.businessStatus,places.primaryType")
                .build();
        this.apiKey = apiKey;
    }

    public List<GoogleCandidate> searchText(String textQuery) throws GoogleApiException {
        if (textQuery == null || textQuery.isBlank()) {
            log.debug("searchText() called with blank query — returning empty result");
            return Collections.emptyList();
        }

        try {
            String requestBody = String.format("{\"textQuery\": \"%s\"}", textQuery.replace("\"", "\\\""));

            GooglePlacesResponse response = placesRestClient.post()
                    .uri("/v1/places:searchText")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        log.warn("Google Places searchText returned HTTP status {} for query='{}'",
                                res.getStatusCode(), textQuery);
                    })
                    .body(GooglePlacesResponse.class);

            if (response == null || response.getPlaces() == null || response.getPlaces().isEmpty()) {
                log.info("Google Places searchText returned no results for query='{}' (ZERO_RESULTS)", textQuery);
                return Collections.emptyList(); // ZERO_RESULTS - not an error
            }

            return response.getPlaces().stream()
                    .map(this::toCandidate)
                    .toList();

        } catch (RestClientException ex) {
            log.error("Google Places searchText call failed for query='{}': {}", textQuery, ex.getMessage());
            throw new GoogleApiException("NETWORK_ERROR", "Network error calling Google Places: " + ex.getMessage());
        }
    }

    private GoogleCandidate toCandidate(GooglePlacesResponse.Place place) {
        String city = extractAddressComponent(place.getAddressComponents(), "locality");
        String state = extractAddressComponent(place.getAddressComponents(), "administrative_area_level_1");
        String postalCode = extractAddressComponent(place.getAddressComponents(), "postal_code");

        Double lat = null;
        Double lng = null;
        if (place.getLocation() != null) {
            lat = place.getLocation().getLatitude();
            lng = place.getLocation().getLongitude();
        }

        return GoogleCandidate.builder()
                .placeId(place.getId())
                .formattedAddress(place.getFormattedAddress())
                .latitude(lat)
                .longitude(lng)
                .city(city)
                .state(state)
                .postalCode(postalCode)
                .propertyType(mapPrimaryTypeToPropertyType(place.getPrimaryType(), place.getTypes()))
                .build();
    }

    private String extractAddressComponent(List<GooglePlacesResponse.Place.AddressComponent> components, String type) {
        if (components == null) return null;
        return components.stream()
                .filter(c -> c.getTypes() != null && c.getTypes().contains(type))
                .map(GooglePlacesResponse.Place.AddressComponent::getLongText)
                .findFirst()
                .orElse(null);
    }

    private String mapPrimaryTypeToPropertyType(String primaryType, List<String> types) {
        return PropertyTypeClassifier.fromPlaces(primaryType, types);
    }

    /**
     * Exception thrown when Google Places API returns an error.
     */
    public static class GoogleApiException extends RuntimeException {
        private final String apiStatus;

        public GoogleApiException(String apiStatus, String message) {
            super(message);
            this.apiStatus = apiStatus;
        }

        public String getApiStatus() {
            return apiStatus;
        }
    }
}