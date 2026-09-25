package com.duedilligenceagent.backend.integration.apify;

import com.duedilligenceagent.backend.integration.apify.ApifyActorInput;
import com.duedilligenceagent.backend.integration.apify.ApifyPropertyListing;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.List;

/**
 * Provider client for the Apify 99acres property-data actor.
 * <p>
 * Runs the configured actor synchronously via
 * {@code POST /v2/acts/{actorId}/run-sync-get-dataset-items} and returns the
 * run's dataset items as external {@link ApifyPropertyListing} DTOs.
 * <p>
 * The actor id, search mode, result cap and timeouts are configurable so a
 * different (already-tested) 99acres actor can be swapped in without code
 * changes. Scraping a live portal takes tens of seconds, so the read
 * timeout is set from {@code app.apify.timeout-seconds}.
 * <p>
 * Takes and returns Apify's external DTOs only — mapping into the internal
 * model lives in {@link ApifyPropertyMapper}.
 */
@Slf4j
@Component
public class ApifyClient {

    private final RestClient restClient;
    private final String token;
    private final String actorId;
    private final String searchMode;
    private final int maxResults;
    private final int timeoutSeconds;

    public ApifyClient(
            RestClient.Builder restClientBuilder,
            @Value("${app.apify.base-url:https://api.apify.com}") String baseUrl,
            @Value("${app.apify.api-key:}") String token,
            @Value("${app.apify.actor-id:thirdwatch~acres99-scraper}") String actorId,
            @Value("${app.apify.search-mode:buy}") String searchMode,
            @Value("${app.apify.max-results:15}") int maxResults,
            @Value("${app.apify.timeout-seconds:120}") int timeoutSeconds) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        // +10s buffer over the run-sync budget for response transfer
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds + 10));
        this.restClient = restClientBuilder
                .requestFactory(factory)
                .baseUrl(baseUrl)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .build();
        this.token = token;
        this.actorId = actorId;
        this.searchMode = searchMode;
        this.maxResults = maxResults;
        this.timeoutSeconds = timeoutSeconds;
    }

    /** True when an Apify API token is configured. */
    public boolean isEnabled() {
        return token != null && !token.isBlank();
    }

    /**
     * Searches 99acres property listings for the resolved location.
     *
     * @param city     resolved city (required by the actor)
     * @param locality resolved neighborhood — null / blank searches the whole city
     * @return the actor's dataset items (empty when the search matched nothing)
     * @throws RestClientException on HTTP errors, network failures or
     *         malformed response bodies
     */
    public List<ApifyPropertyListing> searchProperties(String city, String locality) {
        if (!isEnabled()) {
            throw new IllegalStateException("Apify API token is not configured.");
        }

        ApifyActorInput input = ApifyActorInput.builder()
                .city(city)
                .searchMode(searchMode)
                .localities(locality == null || locality.isBlank() ? null : List.of(locality))
                .maxResults(maxResults)
                .build();

        log.info("Querying Apify actor '{}' for city='{}', locality='{}', searchMode='{}', maxResults={}",
                actorId, city, locality, searchMode, maxResults);

        ApifyPropertyListing[] items = restClient.post()
                .uri("/v2/acts/{actorId}/run-sync-get-dataset-items?token={token}&timeout={timeout}",
                        actorId, token, timeoutSeconds)
                .body(input)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (req, res) ->
                        log.warn("Apify run returned HTTP {} for actor '{}'", res.getStatusCode(), actorId))
                .body(ApifyPropertyListing[].class);

        if (items == null) {
            return List.of();
        }
        log.info("Apify actor '{}' returned {} listing(s) for city='{}'", actorId, items.length, city);
        return List.of(items);
    }
}
