package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.AggregationResponse;
import com.duedilligenceagent.backend.entities.AggregationRun;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.ProviderObservation;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.AggregationRunRepository;
import com.duedilligenceagent.backend.repositories.BuildingPermitDetailsRepository;
import com.duedilligenceagent.backend.repositories.ComparablePropertyDetailsRepository;
import com.duedilligenceagent.backend.repositories.EnvironmentalDetailsRepository;
import com.duedilligenceagent.backend.repositories.FloodZoneDetailsRepository;
import com.duedilligenceagent.backend.repositories.MarketTrendsRepository;
import com.duedilligenceagent.backend.repositories.OwnershipDetailsRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.ProviderObservationRepository;
import com.duedilligenceagent.backend.repositories.TaxDetailsRepository;
import com.duedilligenceagent.backend.repositories.ZoningDetailsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

/**
 * Standalone diligence-data aggregation: inventories the property's
 * <b>stored</b> due-diligence data (records, comparables, market trends)
 * into an aggregation run. Makes no external API calls — external
 * providers exist only as the property-search fallback
 * (see {@code service/search/}).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AggregationService {

    private final PropertyRepository propertyRepository;
    private final AggregationRunRepository aggregationRunRepository;
    private final ProviderObservationRepository providerObservationRepository;
    private final TaxDetailsRepository taxRepository;
    private final FloodZoneDetailsRepository floodRepository;
    private final BuildingPermitDetailsRepository permitRepository;
    private final ZoningDetailsRepository zoningRepository;
    private final EnvironmentalDetailsRepository environmentalRepository;
    private final OwnershipDetailsRepository ownershipRepository;
    private final ComparablePropertyDetailsRepository comparableRepository;
    private final MarketTrendsRepository marketTrendsRepository;

    @Transactional
    public AggregationResponse aggregate(Long propertyId, String requestedAddress) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + propertyId));

        AggregationRun run = aggregationRunRepository.save(AggregationRun.builder()
                .propertyId(propertyId)
                .requestedAddress(requestedAddress == null ? property.getAddress() : requestedAddress)
                .status("RUNNING")
                .startedAt(LocalDateTime.now())
                .build());

        List<ProviderObservation> observations = new ArrayList<>();
        inventoryRecord(observations, run, "tax_records",
                taxRepository.findByPropertyId(propertyId),
                tax -> "paymentStatus=" + tax.getPaymentStatus());
        inventoryRecord(observations, run, "flood_zone",
                floodRepository.findByPropertyId(propertyId),
                flood -> "riskLevel=" + flood.getRiskLevel());
        inventoryRecord(observations, run, "building_permits",
                permitRepository.findByPropertyId(propertyId),
                permit -> "permitStatus=" + permit.getPermitStatus());
        inventoryRecord(observations, run, "zoning",
                zoningRepository.findByPropertyId(propertyId),
                zoning -> "zoningStatus=" + zoning.getZoningStatus());
        inventoryRecord(observations, run, "environmental",
                environmentalRepository.findByPropertyId(propertyId),
                env -> "status=" + env.getStatus());
        inventoryOptional(observations, run, "ownership",
                ownershipRepository.findByPropertyId(propertyId),
                own -> "ownershipType=" + own.getOwnershipType());
        inventoryCount(observations, run, "comparable_properties",
                comparableRepository.findByPropertyId(propertyId).size());
        inventoryCount(observations, run, "market_trends",
                marketTrendsRepository.findByPropertyId(propertyId).size());

        providerObservationRepository.saveAll(observations);
        boolean gaps = observations.stream().anyMatch(item -> "MISSING".equals(item.getStatus()));
        run.setStatus(gaps ? "COMPLETED_WITH_GAPS" : "COMPLETED");
        run.setCompletedAt(LocalDateTime.now());
        aggregationRunRepository.save(run);
        log.info("Aggregated stored diligence data for property id={}: {} sections, gaps={}",
                propertyId, observations.size(), gaps);
        return toResponse(run, observations);
    }

    private <T> void inventoryRecord(List<ProviderObservation> observations, AggregationRun run,
                                     String section, List<T> records, Function<T, String> summary) {
        if (records == null || records.isEmpty()) {
            observations.add(observation(run, section, "MISSING", "records=0"));
        } else {
            observations.add(observation(run, section, "AVAILABLE",
                    "records=" + records.size() + "; " + summary.apply(records.get(0))));
        }
    }

    private <T> void inventoryOptional(List<ProviderObservation> observations, AggregationRun run,
                                       String section, Optional<T> record, Function<T, String> summary) {
        if (record == null || record.isEmpty()) {
            observations.add(observation(run, section, "MISSING", "records=0"));
        } else {
            observations.add(observation(run, section, "AVAILABLE", "records=1; " + summary.apply(record.get())));
        }
    }

    private void inventoryCount(List<ProviderObservation> observations, AggregationRun run,
                                String section, int count) {
        observations.add(observation(run, section, count > 0 ? "AVAILABLE" : "MISSING", "records=" + count));
    }

    private ProviderObservation observation(AggregationRun run, String section, String status, String payload) {
        return ProviderObservation.builder()
                .aggregationRunId(run.getAggregationRunId())
                .propertyId(run.getPropertyId())
                .provider("STORED_DATASET")
                .operation(section)
                .status(status)
                .responsePayload(payload)
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
}
