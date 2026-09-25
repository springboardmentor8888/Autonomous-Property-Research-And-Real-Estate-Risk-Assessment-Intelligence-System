package com.duedilligenceagent.backend.integration.google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * External response model for the Google Address Validation API
 * ({@code POST /v1:validateAddress}).
 * <p>
 * Mirrors the parts of Google's response the application consumes:
 * verdict (granularity / completeness / confirmation flags), the validated
 * address (formatted + components), the geocode (location, place id, types,
 * plus code) and the response id used for validation feedback.
 * <p>
 * Provider-specific shape — mapped into the internal
 * {@link GoogleCandidate} by
 * {@link com.duedilligenceagent.backend.integration.google.GoogleAddressValidationMapper}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleAddressValidationResponse {

    private Result result;
    private String responseId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Result {
        private Verdict verdict;
        private ValidatedAddress address;
        private Geocode geocode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Verdict {
        /** Granularity of the input address itself. */
        private String inputGranularity;
        /** Granularity the address could be validated to (PREMISE, SUB_PREMISE, ROUTE, ...). */
        private String validationGranularity;
        /** Granularity of the geocode (how precisely the location was resolved). */
        private String geocodeGranularity;
        /** True when every address component is present and confirmed. */
        private Boolean addressComplete;
        /** True when at least one component could not be confirmed. */
        private Boolean hasUnconfirmedComponents;
        /** True when Google inferred components the user did not supply. */
        private Boolean hasInferredComponents;
        /** True when Google replaced a supplied component with a different value. */
        private Boolean hasReplacedComponents;
        /** Suggested follow-up action, when Google provides one. */
        private String possibleNextAction;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ValidatedAddress {
        private String formattedAddress;
        private PostalAddress postalAddress;
        private List<AddressComponent> addressComponents;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PostalAddress {
        private String regionCode;
        private String administrativeArea;
        private String locality;
        private String postalCode;
        private List<String> addressLines;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AddressComponent {
        private String componentType;
        private ComponentName componentName;
        private Boolean componentTypeConfirmed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ComponentName {
        private String text;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Geocode {
        private Location location;
        private PlusCode plusCode;
        private String placeId;
        private List<String> placeTypes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Location {
        private Double latitude;
        private Double longitude;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PlusCode {
        private String globalCode;
        private String compoundCode;
    }
}
