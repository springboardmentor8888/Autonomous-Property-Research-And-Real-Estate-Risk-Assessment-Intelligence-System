package com.duedilligenceagent.backend.dto.Google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response payload returned by the Google Geocoding API v4
 * (https://geocode.googleapis.com/v4/geocode/address/{ADDRESS_STRING}).
 * <p>
 * Shape: {@code {"results": [...]}}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleGeocodingResponse {

    @JsonProperty("results")
    private List<Result> results;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Result {

        @JsonProperty("place")
        private String place;

        @JsonProperty("placeId")
        private String placeId;

        @JsonProperty("formattedAddress")
        private String formattedAddress;

        @JsonProperty("location")
        private Location location;

        @JsonProperty("granularity")
        private String granularity;

        @JsonProperty("viewport")
        private Viewport viewport;

        @JsonProperty("postalAddress")
        private PostalAddress postalAddress;

        @JsonProperty("addressComponents")
        private List<AddressComponent> addressComponents;

        @JsonProperty("types")
        private List<String> types;

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
        public static class Viewport {
            private Bounds low;
            private Bounds high;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Bounds {
            private Double latitude;
            private Double longitude;
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

            @JsonProperty("addressLines")
            private List<String> addressLines;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class AddressComponent {
            @JsonProperty("longText")
            private String longText;

            @JsonProperty("shortText")
            private String shortText;

            private List<String> types;

            @JsonProperty("languageCode")
            private String languageCode;
        }
    }
}