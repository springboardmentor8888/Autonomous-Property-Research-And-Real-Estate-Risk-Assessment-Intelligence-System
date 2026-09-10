package com.duedilligenceagent.backend.dto.Google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Normalized candidate from any Google API (Geocoding, Places, Address Validation)
 * that can be used to populate a Property entity.
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
    private String propertyType; // From Places API types, or null
}