package com.duedilligenceagent.backend.service;

import java.math.BigDecimal;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.duedilligenceagent.backend.entities.Property;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ChennaiGisClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChennaiGisClient(
            RestClient.Builder restClientBuilder,
            @Value("${chennai.gcc-gis.base-url}") String baseUrl) {

        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader("Accept", "application/json")
                .build();
    }

    public JsonNode getBuildingInfo(Property property) {
        return queryLayer(4, property);
    }

    public JsonNode getWardInfo(Property property) {
        return queryLayer(6, property);
    }

    public JsonNode getZoneInfo(Property property) {
        return queryLayer(7, property);
    }

    public JsonNode getRiverInfo(Property property) {
        return queryLayer(1, property);
    }

    public JsonNode getStormWaterDrainInfo(Property property) {
        return queryLayer(8, property);
    }

    private JsonNode queryLayer(
            int layerId,
            Property property) {

        BigDecimal latitude = property.getLatitude();
        BigDecimal longitude = property.getLongitude();

        if (latitude == null || longitude == null) {
            throw new IllegalArgumentException(
                    "Property latitude/longitude is required for Chennai GIS lookup."
            );
        }

        String response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/{layerId}/query")
                        .queryParam("geometry", longitude + "," + latitude)
                        .queryParam("geometryType", "esriGeometryPoint")
                        .queryParam("inSR", "4326")
                        .queryParam("spatialRel", "esriSpatialRelIntersects")
                        .queryParam("outFields", "*")
                        .queryParam("returnGeometry", "false")
                        .queryParam("f", "json")
                        .build(layerId))
                .retrieve()
                .body(String.class);

        try {
            return objectMapper.readTree(response);
        } catch (JsonProcessingException ex) {
            log.error(
                    "Failed to parse Chennai GIS response for layer {}: {}",
                    layerId,
                    response,
                    ex
            );

            throw new IllegalStateException(
                    "Unable to parse Chennai GIS response as JSON.",
                    ex
            );
        }
    }
}