package com.duedilligenceagent.backend.dto.Mappls;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response payload returned by the Mappls Geocoding REST API.
 * <p>
 * Only the fields actually consumed by the backend are mapped; everything
 * else is ignored so the client does not break when Mappls adds new fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MapplsGeocodeResponse {

    /** "ok" on success, "error" when the address could not be resolved. */
    private String responseCode;

    /** Human-readable version / status message from Mappls. */
    private String version;

    /** "India" or whatever country Mappls is configured for. */
    private String type;

    /** Number of candidate results returned. */
    private Integer count;

    /** List of candidate addresses — empty when the address is invalid. */
    private List<Candidate> results;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Candidate {

        /** Mappls place identifier (used for downstream property lookups). */
        @JsonProperty("placeId")
        private String placeId;

        /** Display label as returned by Mappls (e.g. "23, MG Road, Bengaluru"). */
        @JsonProperty("placeName")
        private String placeName;

        /** Full address string in a single line. */
        @JsonProperty("formattedAddress")
        private String formattedAddress;

        /** Decimal latitude. */
        private Double latitude;

        /** Decimal longitude. */
        private Double longitude;

        /** City / locality. */
        private String city;

        /** State. */
        private String state;

        /** Pincode / postal code. */
        private String pincode;
    }
}
