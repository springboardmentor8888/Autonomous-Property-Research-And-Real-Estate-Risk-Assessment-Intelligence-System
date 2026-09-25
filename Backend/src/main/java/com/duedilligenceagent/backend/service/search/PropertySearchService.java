package com.duedilligenceagent.backend.service.search;

import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.dto.Property.PropertySearchApiResponse;
import com.duedilligenceagent.backend.dto.Property.PropertySearchResponse;
import com.duedilligenceagent.backend.entities.ActivityLog;
import com.duedilligenceagent.backend.repositories.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

/**
 * Orchestrates the property search as a single pipeline with two clearly
 * separated business paths:
 * <ol>
 *   <li><b>Dataset path</b> ({@link DatasetPropertySearchService}) — the
 *       structured input is matched against the stored due-diligence
 *       dataset (the 50 seeded properties with full records). Stored data
 *       is served with <b>no external API calls</b>.</li>
 *   <li><b>External fallback</b> ({@link ExternalPropertySearchService}) —
 *       only for inputs the dataset does not cover: Google Address
 *       Validation resolves the address, the stored row is reused when
 *       one exists (fetch once), otherwise the validated address is
 *       persisted and enriched with Apify 99acres listings.</li>
 * </ol>
 * Every successful search — either path — records a
 * {@code PROPERTY_SEARCHED} activity event for the user, which drives
 * their search history.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PropertySearchService {

    public static final String SEARCH_EVENT_ACTION = "PROPERTY_SEARCHED";

    private final DatasetPropertySearchService datasetSearch;
    private final ExternalPropertySearchService externalSearch;
    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public PropertySearchApiResponse searchByAddress(PropertyDetailsRequest request, Long searchedByUserId) {
        if (request == null || request.getAddress() == null || request.getAddress().isBlank()) {
            return PropertySearchApiResponse.builder()
                    .success(false)
                    .message("Address is required and must not be blank.")
                    .data(PropertySearchResponse.builder()
                            .status(PropertySearchResponse.Status.INVALID)
                            .message("address must not be blank")
                            .requestedAddress(request != null ? request.getAddress() : null)
                            .results(Collections.emptyList())
                            .build())
                    .build();
        }

        final String fullAddress = StructuredAddressText.fullAddress(request);

        // 1. Seeded due-diligence dataset: stored data, no external calls.
        Optional<SearchOutcome> datasetMatch = datasetSearch.find(request, fullAddress);
        if (datasetMatch.isPresent()) {
            logSearchEvent(searchedByUserId, datasetMatch.get().property());
            return datasetMatch.get().response();
        }

        // 2. External fallback: Google Address Validation + Apify listings.
        SearchOutcome outcome = externalSearch.search(request, fullAddress, searchedByUserId);
        if (outcome.property() != null) {
            logSearchEvent(searchedByUserId, outcome.property());
        }
        return outcome.response();
    }

    /** Records the user's search event — the basis of the search history. */
    private void logSearchEvent(Long userId, com.duedilligenceagent.backend.entities.Property property) {
        if (userId == null) {
            return;
        }
        activityLogRepository.save(ActivityLog.builder()
                .userId(userId)
                .action(SEARCH_EVENT_ACTION)
                .entityType("PROPERTY")
                .entityId(property.getPropertyId())
                .build());
    }
}
