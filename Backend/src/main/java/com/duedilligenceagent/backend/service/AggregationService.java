package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.AggregationRequest;
import com.duedilligenceagent.backend.dto.AggregationResponse;
import com.duedilligenceagent.backend.entities.AggregationRun;
import com.duedilligenceagent.backend.entities.ComparablePropertyDetails;
import com.duedilligenceagent.backend.entities.MarketTrends;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.ProviderObservation;
import com.duedilligenceagent.backend.repositories.AggregationRunRepository;
import com.duedilligenceagent.backend.repositories.ComparablePropertyDetailsRepository;
import com.duedilligenceagent.backend.repositories.MarketTrendsRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.ProviderObservationRepository;
import com.duedilligenceagent.backend.services.AvnesterClient;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AggregationService {

    private static final List<String> PENDING_CONTRACTS = List.of(
            "RBIH_LRS", "NEER_FLOOD", "PROPERTY_TAX", "BUILDING_PERMITS",
            "ZONING", "ENVIRONMENTAL", "UTILITIES"
    );

    private final PropertyRepository propertyRepository;
    private final AggregationRunRepository aggregationRunRepository;
    private final ProviderObservationRepository providerObservationRepository;
    private final ComparablePropertyDetailsRepository comparableRepository;
    private final MarketTrendsRepository marketTrendsRepository;
    private final AvnesterClient avnesterClient;

    @Transactional
    public AggregationResponse aggregate(Long propertyId, String requestedAddress, AggregationRequest request) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found with id: " + propertyId));
        LocalDateTime startedAt = LocalDateTime.now();
        AggregationRun run = aggregationRunRepository.save(AggregationRun.builder()
                .propertyId(propertyId)
                .requestedAddress(requestedAddress == null ? property.getAddress() : requestedAddress)
                .status("RUNNING")
                .startedAt(startedAt)
                .build());

        List<ProviderObservation> observations = new ArrayList<>();
        if (avnesterClient.isEnabled()) {
            collectAvnester(run, property, request, observations);
        } else {
            observations.add(observation(run, "AVNESTER", "search_properties", "NOT_CONFIGURED", null, null,
                    "AVNESTER aggregation is disabled by configuration."));
        }

        for (String provider : PENDING_CONTRACTS) {
            observations.add(observation(run, provider, "aggregate", "CONTRACT_PENDING", null, null,
                    "Provider contract or target jurisdiction is not frozen; no endpoint was called."));
        }

        providerObservationRepository.saveAll(observations);
        run.setStatus(observations.stream().anyMatch(item -> "FAILED".equals(item.getStatus()))
                ? "PARTIAL" : "COMPLETED_WITH_GAPS");
        run.setCompletedAt(LocalDateTime.now());
        aggregationRunRepository.save(run);
        return toResponse(run, observations);
    }

    private void collectAvnester(AggregationRun run, Property property, AggregationRequest request,
                                List<ProviderObservation> observations) {
        try {
            JsonNode response = avnesterClient.searchProperties(request);
            String payload = response == null ? null : response.toString();
            JsonNode listings = response == null ? null : response.path("listings");
            if (response != null && response.path("supported").isBoolean() && !response.path("supported").asBoolean()) {
                observations.add(observation(run, "AVNESTER", "search_properties", "COVERAGE_UNAVAILABLE", 200,
                        payload, "AVnester does not currently support this city."));
            } else {
                if (listings != null && listings.isArray()) {
                    for (JsonNode listing : listings) {
                        comparableRepository.save(toComparable(property, listing));
                    }
                }
                observations.add(observation(run, "AVNESTER", "search_properties", "SUCCESS", 200,
                        payload, null));
            }

            if (request.getLocalityName() != null && !request.getLocalityName().isBlank()) {
                JsonNode insights = avnesterClient.getLocalityInsights(request.getLocalityName(), request.getCity());
                marketTrendsRepository.save(toMarketTrend(property, run, request, insights));
                observations.add(observation(run, "AVNESTER", "get_locality_insights", "SUCCESS", 200,
                        insights == null ? null : insights.toString(), null));
            }
        } catch (RestClientException ex) {
            log.warn("AVnester aggregation failed for property {}: {}", property.getPropertyId(), ex.getMessage());
            observations.add(observation(run, "AVNESTER", "aggregate", "FAILED", null, null, ex.getMessage()));
        }
    }

    private ComparablePropertyDetails toComparable(Property property, JsonNode listing) {
        return ComparablePropertyDetails.builder()
                .propertyId(property.getPropertyId())
                .externalListingId(text(listing, "listingId"))
                .city(text(listing, "city"))
                .locality(text(listing, "localityName"))
                .propertyType(text(listing, "propertyType"))
                .bhk(text(listing, "bhk"))
                .areaSqft(integer(listing, "areaSqft"))
                .price(decimal(listing, "price"))
                .pricePerSqft(decimal(listing, "pricePerSqft"))
                .reraId(text(listing, "reraId"))
                .ageYears(integer(listing, "ageYears"))
                .floor(integer(listing, "floor"))
                .totalFloors(integer(listing, "totalFloors"))
                .handoffUrl(text(listing, "handoffUrl"))
                .verified(listing.has("reraId") && !listing.path("reraId").isNull())
                .source("AVNESTER")
                .retrievedAt(LocalDateTime.now())
                .build();
    }

    private MarketTrends toMarketTrend(Property property, AggregationRun run, AggregationRequest request,
                                       JsonNode insights) {
        return MarketTrends.builder()
                .propertyId(property.getPropertyId())
                .aggregationRunId(run.getAggregationRunId())
                .city(request.getCity())
                .locality(request.getLocalityName())
                .period("CURRENT")
                .averagePricePerSqft(decimal(insights, "avgPricePerSqft"))
                .supplyCount(integer(insights, "supplyCount"))
                .demandPulse(decimal(insights, "demandPulse"))
                .investmentGrade(text(insights, "investmentGrade"))
                .livabilityGrade(text(insights, "livabilityGrade"))
                .source("AVNESTER")
                .retrievedAt(LocalDateTime.now())
                .build();
    }

    private ProviderObservation observation(AggregationRun run, String provider, String operation, String status,
                                           Integer httpStatus, String payload, String errorMessage) {
        return ProviderObservation.builder()
                .aggregationRunId(run.getAggregationRunId())
                .propertyId(run.getPropertyId())
                .provider(provider)
                .operation(operation)
                .status(status)
                .httpStatus(httpStatus)
                .responsePayload(payload)
                .errorMessage(errorMessage)
                .retrievedAt(LocalDateTime.now())
                .build();
    }

    private AggregationResponse toResponse(AggregationRun run, List<ProviderObservation> observations) {
        return AggregationResponse.builder()
                .aggregationRunId(run.getAggregationRunId())
                .propertyId(run.getPropertyId())
                .status(run.getStatus())
                .startedAt(run.getStartedAt())
                .completedAt(run.getCompletedAt())
                .observations(observations.stream().map(item -> AggregationResponse.ProviderObservationResponse.builder()
                        .provider(item.getProvider())
                        .operation(item.getOperation())
                        .status(item.getStatus())
                        .httpStatus(item.getHttpStatus())
                        .externalRecordId(item.getExternalRecordId())
                        .errorMessage(item.getErrorMessage())
                        .retrievedAt(item.getRetrievedAt())
                        .build()).toList())
                .build();
    }

    private static String text(JsonNode node, String field) {
        if (node == null || node.path(field).isMissingNode() || node.path(field).isNull()) return null;
        return node.path(field).asText();
    }

    private static Integer integer(JsonNode node, String field) {
        if (node == null || !node.hasNonNull(field)) return null;
        return node.path(field).asInt();
    }

    private static BigDecimal decimal(JsonNode node, String field) {
        if (node == null || !node.hasNonNull(field)) return null;
        return node.path(field).decimalValue();
    }
}
