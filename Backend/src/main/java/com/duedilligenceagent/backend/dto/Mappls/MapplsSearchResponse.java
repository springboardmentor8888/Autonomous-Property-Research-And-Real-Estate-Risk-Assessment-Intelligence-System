package com.duedilligenceagent.backend.dto.Mappls;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload returned by the Mappls Search Geocoding REST API
 * (https://search.mappls.com/search/address/geocode).
 * <p>
 * Shape: {@code {"copResults": { ... }}}. Only fields consumed by the
 * backend are mapped; everything else is ignored so the client does not
 * break when Mappls adds new fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MapplsSearchResponse {

    /** Single geocoding hit (Mappls Search returns one candidate per call). */
    @JsonProperty("copResults")
    private CopResults copResults;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CopResults {

        /** House / building number, e.g. "237". */
        @JsonProperty("houseNumber")
        private String houseNumber;

        /** Sub-locality, e.g. "Okhla Industrial Estate Phase 3". */
        @JsonProperty("subLocality")
        private String subLocality;

        /** City, e.g. "New Delhi". */
        @JsonProperty("city")
        private String city;

        /** State, e.g. "Delhi". */
        @JsonProperty("state")
        private String state;

        /** Postal code, e.g. "110020". */
        @JsonProperty("pincode")
        private String pincode;

        /** Single-line formatted address as returned by Mappls. */
        @JsonProperty("formattedAddress")
        private String formattedAddress;

        /** Mappls eLoc identifier (used as placeId downstream). */
        @JsonProperty("eLoc")
        private String eLoc;

        /** Confidence score 0..1; null when Mappls does not provide one. */
        @JsonProperty("confidenceScore")
        private Double confidenceScore;
    }
}
