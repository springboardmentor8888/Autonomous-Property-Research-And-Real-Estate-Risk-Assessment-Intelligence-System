package com.duedilligenceagent.backend.services;

import com.duedilligenceagent.backend.dto.Google.GoogleAddressValidationResponse;
import com.duedilligenceagent.backend.dto.Google.GoogleCandidate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Collections;
import java.util.List;

/**
 * Strategy implementation using Google Address Validation API.
 * <p>
 * Endpoint: {@code POST /v1/addresses:validate} on {@code addressvalidation.googleapis.com}.
 * <p>
 * Provides address validation, standardization, and geocoding in one call.
 * Best for: production address validation with USPS CASS support (US addresses).
 */
@Slf4j
public class GoogleAddressValidationStrategy implements AddressValidationStrategy {

    private final RestClient validationRestClient;
    private final String apiKey;

    public GoogleAddressValidationStrategy(
            RestClient.Builder restClientBuilder,
            @Value("${google.address-validation.base-url}") String validationBaseUrl,
            @Value("${google.address-validation.api-key}") String apiKey) {
        this.validationRestClient = restClientBuilder
                .baseUrl(validationBaseUrl)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("X-Goog-Api-Key", apiKey)
                .build();
        this.apiKey = apiKey;
    }

    @Override
    public List<GoogleCandidate> validate(String address) throws AddressValidationException {
        if (address == null || address.isBlank()) {
            log.debug("validate() called with blank address — returning empty result");
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
            }

            return List.of(toCandidate(result));

        } catch (RestClientException ex) {
            log.error("Google Address Validation call failed for address='{}': {}", address, ex.getMessage());
            throw new AddressValidationException("NETWORK_ERROR", "Network error calling Google Address Validation: " + ex.getMessage(), ex);
        }
    }

    @Override
    public String getStrategyName() {
        return "Google Address Validation API";
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
}