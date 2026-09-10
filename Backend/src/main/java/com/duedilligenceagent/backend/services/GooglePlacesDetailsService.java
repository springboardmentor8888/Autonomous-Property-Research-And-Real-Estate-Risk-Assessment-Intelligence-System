package com.duedilligenceagent.backend.services;

import com.duedilligenceagent.backend.dto.Google.GooglePlacesDetailsResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Optional;

/**
 * Thin client for Places API (New) place details. Used ONLY as a fallback
 * enricher when Google Geocoding's match types leave the property type
 * undetermined. Geocoding v4 returns a {@code place} resource name
 * (e.g. "places/ChIJ...") on every result; asking Places for that id
 * yields Google's own {@code primaryType}/{@code types} classification.
 * All failures degrade silently to empty — search must never break.
 */
@Slf4j
@Component
public class GooglePlacesDetailsService {

    private final RestClient restClient;
    private final String apiKey;

    public GooglePlacesDetailsService(
            RestClient.Builder restClientBuilder,
            @Value("${google.places.base-url:https://places.googleapis.com}") String placesBaseUrl,
            @Value("${google.places.api-key:}") String apiKey) {
        this.restClient = restClientBuilder
                .baseUrl(placesBaseUrl)
                .defaultHeader("Accept", "application/json")
                .build();
        this.apiKey = apiKey;
    }

    /**
     * @param placeId bare ChIJ-style id or a full "places/..." resource name
     * @return Google's classification, or empty when unavailable/disabled
     */
    public Optional<GooglePlacesDetailsResponse> fetchDetails(String placeId) {
        if (placeId == null || placeId.isBlank() || apiKey == null || apiKey.isBlank()) {
            return Optional.empty();
        }
        String resource = placeId.startsWith("places/") ? placeId : "places/" + placeId;
        try {
            GooglePlacesDetailsResponse body = restClient.get()
                    .uri("/v1/" + resource)
                    .header("X-Goog-Api-Key", apiKey)
                    .header("X-Goog-FieldMask", "primaryType,types")
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        log.debug("Places details returned HTTP {} for '{}'", res.getStatusCode(), resource);
                    })
                    .body(GooglePlacesDetailsResponse.class);
            return Optional.ofNullable(body);
        } catch (RestClientException ex) {
            log.debug("Places details call failed for '{}': {}", resource, ex.getMessage());
            return Optional.empty();
        }
    }
}
