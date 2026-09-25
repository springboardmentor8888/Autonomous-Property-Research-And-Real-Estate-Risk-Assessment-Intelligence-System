package com.duedilligenceagent.backend.integration.google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Normalized candidate from any Google API (Address Validation, Geocoding,
 * Places) that can be used to populate a Property entity.
 * <p>
 * The Address Validation strategy additionally fills the validation verdict
 * fields (granularity, completeness, plus code, response id) which are
 * persisted on the property row.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleCandidate {

    private String placeId;
    private String formattedAddress;
    private Double latitude;
    private Double longitude;
    private String city;
    private String state;
    private String postalCode;
    /** Neighborhood / sublocality resolved for the address, when available. */
    private String locality;
    private String propertyType; // From Places API types, or null

    // --- Address Validation verdict data (null for the Geocoding strategy) ---

    /** Granularity the address was validated to (e.g. PREMISE, ROUTE). */
    private String validationGranularity;
    /** Granularity of the resolved geocode. */
    private String geocodeGranularity;
    /** True when every address component was present and confirmed. */
    private Boolean addressComplete;
    /** True when at least one component could not be confirmed. */
    private Boolean hasUnconfirmedComponents;
    /** Suggested follow-up action from Google, when present. */
    private String possibleNextAction;
    /** Google place types of the geocoded result (e.g. premise, street_address). */
    private List<String> placeTypes;
    /** Plus code (global) for the resolved location. */
    private String plusCode;
    /** Address Validation response id — required for validation feedback calls. */
    private String responseId;
}