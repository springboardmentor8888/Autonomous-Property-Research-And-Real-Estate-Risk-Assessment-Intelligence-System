package com.duedilligenceagent.backend.service.search;

import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Matches a structured search input against the stored due-diligence
 * dataset (the 50 seeded properties that carry full diligence records).
 * <p>
 * A match short-circuits the external pipeline: the stored property is
 * returned directly with its dataset comparables — no Google Address
 * Validation and no Apify call. The external integrations remain the
 * fallback for anything the dataset does not cover.
 * <p>
 * Scoring (threshold {@value #MATCH_THRESHOLD}):
 * <ul>
 *   <li>city match — required, +2,</li>
 *   <li>project-name containment (the seeded address's first comma
 *       segment, e.g. "Casagrand Pallagio") contained in the input
 *       address line — +5,</li>
 *   <li>partial name (input contained in the project name, min length 4,
 *       e.g. "Pallagio") — +4,</li>
 *   <li>pincode match — +1, locality mentioned in the seeded address — +1.</li>
 * </ul>
 * Token overlap alone can never reach the threshold, so a match always
 * identifies the project by name.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyMatchService {

    /** Minimum score for a dataset match (city + name required). */
    static final int MATCH_THRESHOLD = 6;

    private static final int CITY_SCORE = 2;
    private static final int NAME_CONTAINS_SCORE = 5;
    private static final int NAME_PARTIAL_SCORE = 4;
    private static final int PINCODE_SCORE = 1;
    private static final int LOCALITY_SCORE = 1;
    private static final int MIN_PARTIAL_NAME_LENGTH = 4;

    private final PropertyRepository propertyRepository;

    /**
     * Finds the dataset property matching the search input, if any.
     * City must match; the project name must be identified in the
     * address line. Highest score wins; ties resolve to the lowest
     * property id (deterministic).
     */
    public Optional<Property> findMatch(PropertyDetailsRequest request) {
        if (request.getAddress() == null || request.getAddress().isBlank()) {
            return Optional.empty();
        }

        List<Property> candidates = propertyRepository.findPropertiesWithDiligenceRecords();
        if (candidates.isEmpty()) {
            return Optional.empty();
        }

        String inputAddress = request.getAddress().trim().toLowerCase(Locale.ROOT);
        String inputCity = normalize(request.getCity());
        String inputPincode = normalize(request.getPincode());
        String inputLocality = normalize(request.getLocality());

        Property best = null;
        int bestScore = 0;
        for (Property candidate : candidates) {
            if (inputCity != null && !inputCity.equals(normalize(candidate.getCity()))) {
                continue; // city is required
            }
            int score = score(candidate, inputAddress, inputPincode, inputLocality);
            if (score >= MATCH_THRESHOLD && score > bestScore) {
                best = candidate;
                bestScore = score;
            }
        }

        if (best != null) {
            log.info("Search input matched due-diligence dataset property id={} (score={})",
                    best.getPropertyId(), bestScore);
        }
        return Optional.ofNullable(best);
    }

    private int score(Property candidate, String inputAddress, String inputPincode, String inputLocality) {
        String projectName = projectName(candidate.getAddress());
        if (projectName == null) {
            return 0;
        }

        int score = CITY_SCORE;
        if (inputAddress.contains(projectName)) {
            score += NAME_CONTAINS_SCORE;
        } else if (projectName.length() >= MIN_PARTIAL_NAME_LENGTH
                && projectName.contains(inputAddress)
                && inputAddress.length() >= MIN_PARTIAL_NAME_LENGTH) {
            score += NAME_PARTIAL_SCORE;
        } else {
            return score; // no name identification -> below threshold
        }

        if (inputPincode != null && inputPincode.equals(normalize(candidate.getPostalCode()))) {
            score += PINCODE_SCORE;
        }
        if (inputLocality != null
                && candidate.getAddress() != null
                && candidate.getAddress().toLowerCase(Locale.ROOT).contains(inputLocality)) {
            score += LOCALITY_SCORE;
        }
        return score;
    }

    /** First comma segment of the stored address — the project/building name. */
    static String projectName(String address) {
        if (address == null || address.isBlank()) {
            return null;
        }
        String name = address.split(",")[0].trim().toLowerCase(Locale.ROOT);
        return name.isEmpty() ? null : name;
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
