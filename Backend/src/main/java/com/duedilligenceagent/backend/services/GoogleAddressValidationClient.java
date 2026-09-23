package com.duedilligenceagent.backend.services;

import com.duedilligenceagent.backend.dto.Google.GoogleAddressValidationRequest;
import com.duedilligenceagent.backend.dto.Google.GoogleAddressValidationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;


/**
 * Provider client for the Google Address Validation API.
 * <p>
 * Endpoint: {@code POST /v1:validateAddress} on
 * {@code addressvalidation.googleapis.com}, authenticated with the
 * {@code X-Goog-Api-Key} header.
 * <p>
 * Takes and returns Google's external DTOs only — mapping into the internal
 * model lives in {@link GoogleAddressValidationMapper}.
 */
@Slf4j
@Component
public class GoogleAddressValidationClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GoogleAddressValidationClient(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${google.addressvalidation.base-url:https://addressvalidation.googleapis.com}") String baseUrl,
            @Value("${app.google.addressvalidation.api-key:}") String apiKey) {
        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("X-Goog-Api-Key", apiKey)
                .build();
        this.objectMapper = objectMapper;
    }

    /**
     * Validates the structured address and returns Google's raw response.
     *
     * @throws AddressValidationStrategy.AddressValidationException on HTTP errors,
     *         network failures or malformed response bodies. The Google error
     *         status (e.g. PERMISSION_DENIED, INVALID_ARGUMENT) is preserved
     *         as the exception's apiStatus.
     */
    public GoogleAddressValidationResponse validate(GoogleAddressValidationRequest request) {
        GoogleAddressValidationResponse response;
        try {
            response = restClient.post()
                    .uri("/v1:validateAddress")
                    .body(request)
                    .retrieve()
                    .body(GoogleAddressValidationResponse.class);
        } catch (RestClientResponseException ex) {
            String status = readErrorStatus(ex.getResponseBodyAsString());
            log.warn("Google Address Validation returned HTTP {} ({})", ex.getStatusCode(), status);
            throw new AddressValidationStrategy.AddressValidationException(
                    status != null ? status : "HTTP_" + ex.getStatusCode().value(),
                    "Google Address Validation API error: " + ex.getMessage(), ex);
        } catch (RestClientException ex) {
            log.error("Google Address Validation call failed: {}", ex.getMessage());
            throw new AddressValidationStrategy.AddressValidationException(
                    "NETWORK_ERROR", "Network error calling Google Address Validation: " + ex.getMessage(), ex);
        }

        if (response == null || response.getResult() == null) {
            throw new AddressValidationStrategy.AddressValidationException(
                    "EMPTY_RESPONSE", "Google Address Validation returned an empty result.");
        }
        return response;
    }

    /**
     * Best-effort extraction of the {@code error.status} field from Google's
     * error body so callers can distinguish permission/quota issues.
     */
    private String readErrorStatus(String errorBody) {
        if (errorBody == null || errorBody.isBlank()) {
            return null;
        }
        try {
            JsonNode node = objectMapper.readTree(errorBody);
            JsonNode status = node.path("error").path("status");
            if (status.isMissingNode() || status.isNull()) {
                return null;
            }
            String value = status.asText();
            return value.isBlank() ? null : value;
        } catch (Exception ex) {
            return null;
        }
    }
}
