package com.duedilligenceagent.backend.dto.Property;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Result returned to the frontend after a property search.
 * <p>
 * {@code status} is the single field the frontend should branch on:
 * <ul>
 *   <li>{@code VALID}   — Google validated the address, see {@link #results}.</li>
 *   <li>{@code INVALID} — the address could not be validated, see {@link #message}.</li>
 *   <li>{@code ERROR}   — Upstream Google call failed; see {@link #message}.</li>
 * </ul>
 * <p>
 * On VALID, {@link #listingsStatus} reports the outcome of the external
 * property-listing search (Apify 99acres): {@code FOUND} listings are in
 * {@link #listings}, {@code NO_RESULTS} means the portal had nothing for the
 * resolved location, {@code UNAVAILABLE} means the listing provider was not
 * configured or failed — the validated address result is still usable.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PropertySearchResponse {

    public enum Status { VALID, INVALID, ERROR }

    public enum ListingsStatus { FOUND, NO_RESULTS, UNAVAILABLE }

    /** Outcome of the address validation. */
    private Status status;

    /** Human-readable string message (always present for INVALID / ERROR). */
    private String message;

    /** Original address the user typed, echoed back. */
    private String requestedAddress;

    /** Resolved candidate places (empty when status != VALID). */
    private List<ResolvedPlace> results;

    /** Outcome of the external property-listing search. */
    private ListingsStatus listingsStatus;

    /** Explanation when listingsStatus is NO_RESULTS or UNAVAILABLE. */
    private String listingsMessage;

    /** External property listings mapped into the internal model (null when not fetched). */
    private List<PropertyListing> listings;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResolvedPlace {
        /** Database id of the persisted Property row (null when not persisted). */
        private Long propertyId;
        private String placeId;
        private String formattedAddress;
        private Double latitude;
        private Double longitude;
        private String city;
        private String state;
        private String pincode;
        private String locality;
        /** Google Address Validation verdict data. */
        private String validationGranularity;
        private String geocodeGranularity;
        private Boolean addressComplete;
        private Boolean hasUnconfirmedComponents;
        private String possibleNextAction;
        private List<String> placeTypes;
        private String plusCode;
    }
}
