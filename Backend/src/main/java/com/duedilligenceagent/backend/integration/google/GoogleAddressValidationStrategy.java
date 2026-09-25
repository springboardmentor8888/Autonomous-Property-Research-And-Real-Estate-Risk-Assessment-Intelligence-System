package com.duedilligenceagent.backend.integration.google;

import com.duedilligenceagent.backend.integration.google.GoogleAddressValidationRequest;
import com.duedilligenceagent.backend.integration.google.GoogleAddressValidationResponse;
import com.duedilligenceagent.backend.integration.google.GoogleCandidate;
import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.service.search.StructuredAddressText;
import com.duedilligenceagent.backend.service.search.AddressValidationStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Strategy implementation using the Google Address Validation API.
 * <p>
 * Endpoint: {@code POST /v1:validateAddress} on
 * {@code addressvalidation.googleapis.com}.
 * <p>
 * Maps the application's structured address input onto Google's
 * {@code PostalAddress}: state → administrativeArea, city → locality,
 * pincode → postalCode and the premise-level text (address line, house/plot,
 * building, street, locality) → addressLines. Region is fixed to {@code IN}.
 * <p>
 * Compared to plain geocoding this also yields the validation verdict
 * (granularity, address completeness, unconfirmed components) which is
 * persisted with the property.
 */
@Slf4j
@Component
public class GoogleAddressValidationStrategy implements AddressValidationStrategy {

    /** This system targets Indian addresses. */
    private static final String REGION_CODE_IN = "IN";

    private final GoogleAddressValidationClient client;
    private final GoogleAddressValidationMapper mapper;
    private final String apiKey;

    public GoogleAddressValidationStrategy(
            GoogleAddressValidationClient client,
            GoogleAddressValidationMapper mapper,
            @Value("${app.google.addressvalidation.api-key:}") String apiKey) {
        this.client = client;
        this.mapper = mapper;
        this.apiKey = apiKey;
    }

    @Override
    public List<GoogleCandidate> validate(PropertyDetailsRequest request) throws AddressValidationException {
        if (request == null || isBlank(request.getAddress())) {
            log.debug("validate() called with blank address — returning empty result");
            return List.of();
        }

        if (isBlank(apiKey)) {
            log.error("Google Address Validation API key is not configured. "
                    + "Set app.google.addressvalidation.api-key (or app.google.geocoding.api-key) in .env");
            throw new AddressValidationException("CONFIG_ERROR",
                    "Google Address Validation API key is not configured. Please provide a valid API key.");
        }

        GoogleAddressValidationRequest externalRequest = GoogleAddressValidationRequest.builder()
                .address(GoogleAddressValidationRequest.PostalAddress.builder()
                        .regionCode(REGION_CODE_IN)
                        .administrativeArea(trim(request.getState()))
                        .locality(trim(request.getCity()))
                        .postalCode(trim(request.getPincode()))
                        .addressLines(List.of(StructuredAddressText.premiseLine(request)))
                        .build())
                .build();

        log.debug("Validating address via Google Address Validation: {}", externalRequest.getAddress().getAddressLines());

        GoogleAddressValidationResponse response = client.validate(externalRequest);
        GoogleCandidate candidate = mapper.toCandidate(response);

        if (candidate == null) {
            log.info("Google Address Validation could not validate the address (granularity unspecified, no geocode)");
            return List.of();
        }

        log.info("Google Address Validation resolved '{}' -> '{}' (validationGranularity={}, geocodeGranularity={}, addressComplete={})",
                candidate.getFormattedAddress() != null ? candidate.getFormattedAddress() : request.getAddress(),
                candidate.getFormattedAddress(),
                candidate.getValidationGranularity(), candidate.getGeocodeGranularity(),
                candidate.getAddressComplete());

        return List.of(candidate);
    }

    @Override
    public String getStrategyName() {
        return "Google Address Validation API";
    }

    private static String trim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
