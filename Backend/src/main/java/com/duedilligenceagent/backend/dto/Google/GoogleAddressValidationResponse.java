package com.duedilligenceagent.backend.dto.Google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response payload returned by the Google Address Validation API
 * (https://addressvalidation.googleapis.com/v1/addresses:validate).
 * <p>
 * Shape: {@code {"result": {...}}}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleAddressValidationResponse {

    private Result result;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Result {

        @JsonProperty("verdict")
        private Verdict verdict;

        @JsonProperty("address")
        private ValidatedAddress address;

        @JsonProperty("geocode")
        private Geocode geocode;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Verdict {

            @JsonProperty("inputGranularity")
            private String inputGranularity;

            @JsonProperty("validationGranularity")
            private String validationGranularity;

            @JsonProperty("geocodeGranularity")
            private String geocodeGranularity;

            @JsonProperty("addressComplete")
            private Boolean addressComplete;

            @JsonProperty("hasUnconfirmedComponents")
            private Boolean hasUnconfirmedComponents;

            @JsonProperty("hasInferredComponents")
            private Boolean hasInferredComponents;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class ValidatedAddress {

            @JsonProperty("formattedAddress")
            private String formattedAddress;

            @JsonProperty("postalAddress")
            private PostalAddress postalAddress;

            @JsonProperty("addressComponents")
            private List<AddressComponent> addressComponents;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class PostalAddress {

            @JsonProperty("regionCode")
            private String regionCode;

            @JsonProperty("languageCode")
            private String languageCode;

            @JsonProperty("postalCode")
            private String postalCode;

            @JsonProperty("administrativeArea")
            private String administrativeArea;

            @JsonProperty("locality")
            private String locality;

            @JsonProperty("sublocality")
            private String sublocality;

            @JsonProperty("addressLines")
            private List<String> addressLines;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class AddressComponent {

            @JsonProperty("componentName")
            private ComponentName componentName;

            @JsonProperty("componentType")
            private String componentType;

            @JsonProperty("confirmationLevel")
            private String confirmationLevel;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class ComponentName {

            private String text;
            private String languageCode;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Geocode {

            @JsonProperty("location")
            private Location location;

            @JsonProperty("placeId")
            private String placeId;

            @JsonProperty("plusCode")
            private PlusCode plusCode;

            @JsonProperty("types")
            private List<String> types;
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

            @JsonProperty("globalCode")
            private String globalCode;

            @JsonProperty("compoundCode")
            private String compoundCode;
        }
    }
}