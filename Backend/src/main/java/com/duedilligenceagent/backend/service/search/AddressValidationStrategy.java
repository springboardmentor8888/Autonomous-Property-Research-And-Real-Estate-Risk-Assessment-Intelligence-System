package com.duedilligenceagent.backend.service.search;

import com.duedilligenceagent.backend.integration.google.GoogleCandidate;
import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;

import java.util.List;

/**
 * Strategy interface for address validation and geocoding services.
 * <p>
 * Allows plugging in different Google Maps Platform APIs (Address Validation,
 * Geocoding, Places) via configuration without changing the orchestration layer.
 * <p>
 * Implementations receive the application's structured address input and own
 * the conversion into their provider-specific request format.
 * <p>
 * Each implementation must return a list of normalized {@link GoogleCandidate}
 * objects, with the first element being the best match.
 */
public interface AddressValidationStrategy {

    /**
     * Validates and/or geocodes the given structured address.
     *
     * @param request structured address input from the user
     * @return list of candidates (empty if address not found); first candidate is the best match
     * @throws AddressValidationException on API errors (network, quota, auth, etc.)
     */
    List<GoogleCandidate> validate(PropertyDetailsRequest request) throws AddressValidationException;

    /**
     * Returns the human-readable name of this strategy for logging/config display.
     */
    String getStrategyName();

    /**
     * Exception thrown when the underlying address validation API returns an error
     * status (REQUEST_DENIED, OVER_QUERY_LIMIT, INVALID_REQUEST, etc.) or a
     * network failure occurs.
     * <p>
     * Distinguishes API errors from genuine "address not found" (which returns
     * an empty list, not an exception).
     */
    class AddressValidationException extends RuntimeException {
        private final String apiStatus;

        public AddressValidationException(String apiStatus, String message) {
            super(message);
            this.apiStatus = apiStatus;
        }

        public AddressValidationException(String apiStatus, String message, Throwable cause) {
            super(message, cause);
            this.apiStatus = apiStatus;
        }

        public String getApiStatus() {
            return apiStatus;
        }
    }
}