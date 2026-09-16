package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Data Transfer Object (DTO) used to send the result of
 * address validation back to the client.
 *
 * This DTO contains the standardized address information
 * returned after the address is validated.
 *
 * Example JSON response:
 *
 * {
 *     "formattedAddress": "Kukatpally, Hyderabad, Telangana, India",
 *     "city": "Hyderabad",
 *     "state": "Telangana",
 *     "postalCode": "500072",
 *     "country": "India",
 *     "latitude": 17.4849,
 *     "longitude": 78.4138,
 *     "valid": true
 * }
 */
@Data
@AllArgsConstructor
public class AddressValidationResponse {

    /*
     * Complete/standardized version of the address returned
     * by the address validation service.
     */
    private String formattedAddress;

    /*
     * City identified from the validated address.
     */
    private String city;

    /*
     * State identified from the validated address.
     */
    private String state;

    /*
     * Postal/PIN code identified from the validated address.
     */
    private String postalCode;

    /*
     * Country identified from the validated address.
     */
    private String country;

    /*
     * Geographic latitude of the validated address.
     *
     * Latitude represents the north-south position
     * of a location on Earth.
     */
    private double latitude;

    /*
     * Geographic longitude of the validated address.
     *
     * Longitude represents the east-west position
     * of a location on Earth.
     */
    private double longitude;

    /*
     * Indicates whether the supplied address was successfully
     * validated.
     *
     * true  -> Address is valid/recognized.
     * false -> Address could not be validated.
     */
    private boolean valid;
}