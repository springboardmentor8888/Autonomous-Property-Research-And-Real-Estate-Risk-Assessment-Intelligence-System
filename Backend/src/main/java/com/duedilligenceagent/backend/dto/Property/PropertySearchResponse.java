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
 *   <li>{@code VALID}   — Mappls resolved the address, see {@link #results}.</li>
 *   <li>{@code INVALID} — Mappls could not resolve the address, see {@link #message}.</li>
 *   <li>{@code ERROR}   — Upstream Mappls call failed; see {@link #message}.</li>
 * </ul>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PropertySearchResponse {

    public enum Status { VALID, INVALID, ERROR }

    /** Outcome of the address validation. */
    private Status status;

    /** Human-readable string message (always present for INVALID / ERROR). */
    private String message;

    /** Original address the user typed, echoed back. */
    private String requestedAddress;

    /** Resolved candidate places (empty when status != VALID). */
    private List<ResolvedPlace> results;

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
    }
}
