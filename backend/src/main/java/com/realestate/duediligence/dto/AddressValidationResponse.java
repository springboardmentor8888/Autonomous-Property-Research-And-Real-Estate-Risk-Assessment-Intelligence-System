package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AddressValidationResponse {
    private String formattedAddress;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private double latitude;
    private double longitude;
    private boolean valid;
}