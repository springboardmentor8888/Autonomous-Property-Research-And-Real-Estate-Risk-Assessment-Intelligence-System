package com.duedilligenceagent.backend.services;

import com.duedilligenceagent.backend.dto.AggregationRequest;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestClientException;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
public class AvnesterClient {

    private final RestClient restClient;
    private final boolean enabled;

    public AvnesterClient(
            RestClient.Builder restClientBuilder,
            @Value("${avnester.base-url:https://api.avnester.com}") String baseUrl,
            @Value("${avnester.enabled:false}") boolean enabled) {
        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .build();
        this.enabled = enabled;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public JsonNode searchProperties(AggregationRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        putIfPresent(body, "city", request.getCity());
        putIfPresent(body, "localityName", request.getLocalityName());
        putIfPresent(body, "propertyType", request.getPropertyType());
        putIfPresent(body, "bhk", request.getBhk());
        putIfPresent(body, "transactionType", request.getTransactionType());
        putIfPresent(body, "minPrice", request.getMinPrice());
        putIfPresent(body, "maxPrice", request.getMaxPrice());
        body.put("limit", request.getLimit() == null ? 5 : Math.min(request.getLimit(), 20));
        return postWithRateLimitRetry("/public/v1/search_properties", body);
    }

    public JsonNode getLocalityInsights(String localityName, String city) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("localityName", localityName);
        putIfPresent(body, "city", city);
        return postWithRateLimitRetry("/public/v1/get_locality_insights", body);
    }

    private JsonNode postWithRateLimitRetry(String path, Map<String, Object> body) {
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                ResponseEntity<JsonNode> response = restClient.post()
                        .uri(path)
                        .body(body)
                        .retrieve()
                        .toEntity(JsonNode.class);
                return response.getBody();
            } catch (RestClientResponseException ex) {
                if (ex.getStatusCode().value() != 429 || attempt == 2) {
                    throw ex;
                }
                long backoffMillis = 250L * (attempt + 1);
                log.warn("AVnester rate limited operation {}; retrying in {}ms", path, backoffMillis);
                sleepBeforeRetry(backoffMillis);
            } catch (RestClientException ex) {
                throw ex;
            }
        }
        throw new IllegalStateException("AVnester request retry loop ended unexpectedly");
    }

    private static void putIfPresent(Map<String, Object> body, String key, Object value) {
        if (value != null && (!(value instanceof String) || !((String) value).isBlank())) {
            body.put(key, value);
        }
    }

    private static void sleepBeforeRetry(long backoffMillis) {
        try {
            Thread.sleep(backoffMillis);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while backing off an AVnester request", ex);
        }
    }
}
