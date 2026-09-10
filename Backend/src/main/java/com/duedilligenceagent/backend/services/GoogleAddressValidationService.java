package com.duedilligenceagent.backend.services;

import com.duedilligenceagent.backend.dto.Google.GoogleAddressValidationResponse;
import com.duedilligenceagent.backend.dto.Google.GoogleCandidate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Collections;
import java.util.List;

/**
 * Thin wrapper around the Google Address Validation API.
 * <p>
 * Uses the auto-configured {@link RestClient.Builder} provided by Spring
 * Boot. The base URL is read from {@code application.properties}; the API key
 * is loaded from the {@code GOOGLE_GEOCODING_API_KEY} environment variable.
 * <p>
 * Endpoint: {@code POST /v1/addresses:validate}
 * on {@code addressvalidation.googleapis.com}.
 * <p>
 * Returns empty list on no result; throws {@link GoogleApiException} on API errors.
 * Provides address validation, standardization, and geocoding in one call.
 * <p>
 * <b>NOTE:</b> This service is currently disabled in favor of Google Geocoding API only.
 * Remove @Service annotation to prevent auto-instantiation.
 */
@Slf4j
public class GoogleAddressValidationService {

    private final RestClient validationRestClient;
    private final String apiKey;

    public GoogleAddressValidationService(
            RestClient.Builder restClientBuilder,
            @Value("${google.address-validation.base-url}") String validationBaseUrl,
            @Value("${google.geocoding.api-key}") String apiKey) {
        this.validationRestClient = restClientBuilder
                .baseUrl(validationBaseUrl)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("X-Goog-Api-Key", apiKey)
                .build();
        this.apiKey = apiKey;
    }

    public List<GoogleCandidate> validateAddress(String address) throws GoogleApiException {
        if (address == null || address.isBlank()) {
            log.debug("validateAddress() called with blank address — returning empty result");
            return Collections.emptyList();
        }

        try {
            String requestBody = String.format(
                    "{\"address\": {\"addressLines\": [\"%s\"]}, \"enableUspsCass\": false}",
                    address.replace("\"", "\\\""));

            GoogleAddressValidationResponse response = validationRestClient.post()
                    .uri("/v1/addresses:validate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        log.warn("Google Address Validation returned HTTP status {} for address='{}'",
                                res.getStatusCode(), address);
                    })
                    .body(GoogleAddressValidationResponse.class);

            if (response == null || response.getResult() == null
                    || response.getResult().getAddress() == null
                    || response.getResult().getGeocode() == null) {
                log.info("Google Address Validation returned no result for address='{}'", address);
                return Collections.emptyList();
            }

            GoogleAddressValidationResponse.Result result = response.getResult();

            // Check if address is valid enough
            if (Boolean.FALSE.equals(result.getVerdict().getAddressComplete())
                    && Boolean.TRUE.equals(result.getVerdict().getHasUnconfirmedComponents())) {
                log.info("Google Address Validation: address incomplete or unconfirmed for '{}'", address);
                // Still return the candidate, but mark as potentially invalid
            }

            return List.of(toCandidate(result));

        } catch (RestClientException ex) {
            log.error("Google Address Validation call failed for address='{}': {}", address, ex.getMessage());
            throw new GoogleApiException("NETWORK_ERROR", "Network error calling Google Address Validation: " + ex.getMessage());
        }
    }

    private GoogleCandidate toCandidate(GoogleAddressValidationResponse.Result result) {
        GoogleAddressValidationResponse.Result.ValidatedAddress validatedAddress = result.getAddress();
        GoogleAddressValidationResponse.Result.Geocode geocode = result.getGeocode();

        String city = extractFromPostalAddress(validatedAddress.getPostalAddress(), "locality");
        String state = extractFromPostalAddress(validatedAddress.getPostalAddress(), "administrativeArea");
        String postalCode = validatedAddress.getPostalAddress() != null
                ? validatedAddress.getPostalAddress().getPostalCode()
                : null;

        Double lat = null;
        Double lng = null;
        if (geocode.getLocation() != null) {
            lat = geocode.getLocation().getLatitude();
            lng = geocode.getLocation().getLongitude();
        }

        return GoogleCandidate.builder()
                .placeId(geocode.getPlaceId())
                .formattedAddress(validatedAddress.getFormattedAddress())
                .latitude(lat)
                .longitude(lng)
                .city(city)
                .state(state)
                .postalCode(postalCode)
                .propertyType(null) // Address validation doesn't provide property type
                .build();
    }

    private String extractFromPostalAddress(GoogleAddressValidationResponse.Result.PostalAddress postalAddress, String field) {
        if (postalAddress == null) return null;
        return switch (field) {
            case "locality" -> postalAddress.getLocality();
            case "administrativeArea" -> postalAddress.getAdministrativeArea();
            case "postalCode" -> postalAddress.getPostalCode();
            case "sublocality" -> postalAddress.getSublocality();
            default -> null;
        };
    }

    /**
     * Exception thrown when Google Address Validation API returns an error.
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