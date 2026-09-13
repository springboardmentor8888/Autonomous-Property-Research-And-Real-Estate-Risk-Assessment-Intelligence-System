package com.realestate.duediligence.dto;

import lombok.Data;

/**
 * DTO representing the response returned to the frontend
 * after validating a property address via Geoapify.
 *
 * Example response body:
 * {
 *   "valid": true,
 *   "formattedAddress": "1600 Pennsylvania Avenue NW, Washington, DC 20500, United States",
 *   "city": "Washington",
 *   "state": "District of Columbia",
 *   "postalCode": "20500",
 *   "country": "United States",
 *   "latitude": 38.897699,
 *   "longitude": -77.036530
 * }
 */
@Data
public class AddressValidationResponse {

    /**
     * True if Geoapify found a matching address, false otherwise.
     */
    private boolean valid;

    /**
     * The full, normalised address string returned by Geoapify.
     * Null when valid = false.
     */
    private String formattedAddress;

    /** City name. Null when valid = false. */
    private String city;

    /** State / region name. Null when valid = false. */
    private String state;

    /** Postal / ZIP code. Null when valid = false. */
    private String postalCode;

    /** Country name. Null when valid = false. */
    private String country;

    /** Latitude in decimal degrees. Null when valid = false. */
    private Double latitude;

    /** Longitude in decimal degrees. Null when valid = false. */
    private Double longitude;
}
