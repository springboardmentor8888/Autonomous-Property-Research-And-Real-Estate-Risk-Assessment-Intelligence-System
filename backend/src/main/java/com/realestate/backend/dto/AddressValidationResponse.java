package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AddressValidationResponse {

    private Long propertyId;
    private String address;
    private boolean valid;
    private String message;
}