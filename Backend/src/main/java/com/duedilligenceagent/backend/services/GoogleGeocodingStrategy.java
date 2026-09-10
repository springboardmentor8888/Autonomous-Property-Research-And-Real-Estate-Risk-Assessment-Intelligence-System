package com.duedilligenceagent.backend.services;

import com.duedilligenceagent.backend.dto.Google.GoogleCandidate;
import com.duedilligenceagent.backend.dto.Google.GoogleGeocodingResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Strategy implementation using Google Geocoding API v4.
 * <p>
 * Endpoint: {@code GET /v4/geocode/address/{ADDRESS_STRING}} on {@code geocode.googleapis.com}.
 * <p>
 * Uses X-Goog-Api-Key header for authentication.
 * Best for: basic geocoding needs, modern API with rich address metadata.
 */
@Slf4j
@Component
public class GoogleGeocodingStrategy implements AddressValidationStrategy {

    private final RestClient googleRestClient;
    private final String apiKey;

    public GoogleGeocodingStrategy(
            RestClient.Builder restClientBuilder,
            @Value("${google.api.base-url}") String googleBaseUrl,
            @Value("${google.geocoding.api-key}") String apiKey) {
        this.googleRestClient = restClientBuilder
                .baseUrl(googleBaseUrl)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("X-Goog-Api-Key", apiKey)
                .build();
        this.apiKey = apiKey;
    }

    @Override
    public List<GoogleCandidate> validate(String address) throws AddressValidationException {
        if (address == null || address.isBlank()) {
            log.debug("validate() called with blank address — returning empty result");
            return List.of();
        }

        // Require real API key - no mock fallback
        if (apiKey == null || apiKey.isBlank()) {
            log.error("GOOGLE_GEOCODING_API_KEY is not configured. Set google.geocoding.api-key in application.properties");
            throw new AddressValidationException("CONFIG_ERROR", "Google Geocoding API key is not configured. Please provide a valid API key.");
        }

        try {
            // URL encode the address for path parameter
            String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);

            GoogleGeocodingResponse response = googleRestClient.get()
                    .uri("/v4/geocode/address/" + encodedAddress)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        log.warn("Google Geocoding v4 returned HTTP status {} for address='{}'",
                                res.getStatusCode(), address);
                    })
                    .body(GoogleGeocodingResponse.class);

            if (response == null || response.getResults() == null || response.getResults().isEmpty()) {
                log.info("Google Geocoding v4 returned no results for address='{}'", address);
                return List.of(); // ZERO_RESULTS - genuinely invalid address
            }

            return response.getResults().stream()
                    .map(this::toCandidate)
                    .collect(Collectors.toList());

        } catch (RestClientException ex) {
            log.error("Google Geocoding v4 call failed for address='{}': {}", address, ex.getMessage());
            throw new AddressValidationException("NETWORK_ERROR", "Network error calling Google Geocoding v4: " + ex.getMessage(), ex);
        }
    }

    @Override
    public String getStrategyName() {
        return "Google Geocoding API v4";
    }

    private GoogleCandidate toCandidate(GoogleGeocodingResponse.Result result) {
        String city = null;
        String state = null;
        String postalCode = null;

        // Use postalAddress if available (more structured)
        if (result.getPostalAddress() != null) {
            city = result.getPostalAddress().getLocality();
            state = result.getPostalAddress().getAdministrativeArea();
            postalCode = result.getPostalAddress().getPostalCode();
        }

        // Fallback to address components
        if (city == null || state == null || postalCode == null) {
            if (result.getAddressComponents() != null) {
                for (GoogleGeocodingResponse.Result.AddressComponent comp : result.getAddressComponents()) {
                    if (comp.getTypes() != null) {
                        if (comp.getTypes().contains("locality") && city == null) {
                            city = comp.getLongText();
                        }
                        if (comp.getTypes().contains("administrative_area_level_1") && state == null) {
                            state = comp.getLongText();
                        }
                        if (comp.getTypes().contains("postal_code") && postalCode == null) {
                            postalCode = comp.getLongText();
                        }
                    }
                }
            }
        }

        Double lat = null;
        Double lng = null;
        if (result.getLocation() != null) {
            lat = result.getLocation().getLatitude();
            lng = result.getLocation().getLongitude();
        }

        return GoogleCandidate.builder()
                .placeId(result.getPlaceId())
                .formattedAddress(result.getFormattedAddress())
                .latitude(lat)
                .longitude(lng)
                .city(city)
                .state(state)
                .postalCode(postalCode)
                .propertyType(inferPropertyType(result.getTypes()))
                .build();
    }

    private String inferPropertyType(List<String> types) {
        return PropertyTypeClassifier.fromGeocodingTypes(types);
    }
}