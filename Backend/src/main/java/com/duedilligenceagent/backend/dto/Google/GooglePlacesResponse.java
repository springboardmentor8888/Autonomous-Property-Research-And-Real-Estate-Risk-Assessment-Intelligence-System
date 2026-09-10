package com.duedilligenceagent.backend.dto.Google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response payload returned by the Google Places API (New) Text Search
 * (https://places.googleapis.com/v1/places:searchText).
 * <p>
 * Shape: {@code {"places": [...]}}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GooglePlacesResponse {

    private List<Place> places;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Place {

        @JsonProperty("id")
        private String id;

        @JsonProperty("displayName")
        private DisplayName displayName;

        @JsonProperty("formattedAddress")
        private String formattedAddress;

        @JsonProperty("location")
        private Location location;

        @JsonProperty("addressComponents")
        private List<AddressComponent> addressComponents;

        @JsonProperty("types")
        private List<String> types;

        @JsonProperty("businessStatus")
        private String businessStatus;

        @JsonProperty("primaryType")
        private String primaryType;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class DisplayName {

            private String text;
            private String languageCode;
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
        public static class AddressComponent {

            @JsonProperty("longText")
            private String longText;

            @JsonProperty("shortText")
            private String shortText;

            private List<String> types;
        }
    }
}