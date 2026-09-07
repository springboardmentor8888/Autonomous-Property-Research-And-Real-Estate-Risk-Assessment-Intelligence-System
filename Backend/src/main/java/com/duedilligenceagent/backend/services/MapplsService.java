package com.duedilligenceagent.backend.services;

import com.duedilligenceagent.backend.dto.Mappls.MapplsGeocodeResponse;
import com.duedilligenceagent.backend.dto.Mappls.MapplsSearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

/**
 * Thin wrapper around the Mappls Geocoding REST API.
 * <p>
 * Uses the auto-configured {@link RestClient.Builder} provided by Spring
 * Boot (the {@code spring-boot-starter-restclient} dependency).
 * The base URL is read from {@code application.properties}; the access
 * token is loaded from {@code mappls-credentials.properties}.
 * <p>
 * Endpoint: {@code GET /search/address/geocode?address=...&access_token=...}
 * on {@code search.mappls.com}. The older
 * {@code apis.mappls.com/advancedmaps/v1/{token}/geo_code} returns
 * HTTP 412 with current credentials, so this service uses the supported
 * Search API instead.
 * <p>
 * Returns an empty list on failure so callers can decide on the
 * user-facing response without exception handling.
 */
@Service
@Slf4j
public class MapplsService {

    private final RestClient mapplsRestClient;
    private final String accessToken;

    public MapplsService(
            RestClient.Builder restClientBuilder,
            @Value("${mappls.api.base-url}") String mapplsBaseUrl,
            @Value("${mappls.api.access-token}") String accessToken) {
        this.mapplsRestClient = restClientBuilder
                .baseUrl(mapplsBaseUrl)
                .defaultHeader("Accept", "application/json")
                .build();
        this.accessToken = accessToken;
    }

    public List<MapplsGeocodeResponse.Candidate> geocode(String address) {
        if (address == null || address.isBlank()) {
            log.debug("geocode() called with blank address — returning empty result");
            return List.of();
        }

        try {
            MapplsSearchResponse response = mapplsRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/address/geocode")
                            .queryParam("address", address)
                            .queryParam("access_token", accessToken)
                            .build())
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        log.warn("Mappls geocode returned status {} for address='{}'",
                                res.getStatusCode(), address);
                    })
                    .body(MapplsSearchResponse.class);

            if (response == null || response.getCopResults() == null) {
                log.warn("Mappls geocode returned empty body for address='{}'", address);
                return List.of();
            }

            MapplsSearchResponse.CopResults r = response.getCopResults();
            MapplsGeocodeResponse.Candidate candidate = MapplsGeocodeResponse.Candidate.builder()
                    .placeId(r.getELoc())
                    .placeName(r.getFormattedAddress())
                    .formattedAddress(r.getFormattedAddress())
                    .city(r.getCity())
                    .state(r.getState())
                    .pincode(r.getPincode())
                    .build();

            return List.of(candidate);
        } catch (RestClientException ex) {
            log.error("Mappls geocode call failed for address='{}': {}", address, ex.getMessage());
            return List.of();
        }
    }
}
