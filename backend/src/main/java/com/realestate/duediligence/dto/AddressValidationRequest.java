package com.realestate.duediligence.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO representing the request body for address validation.
 *
 * Example request body:
 * { "address": "1600 Pennsylvania Avenue NW, Washington, D.C. 20500" }
 */
@Data
public class AddressValidationRequest {

    /**
     * The full address string to validate.
     * Must not be blank.
     */
    @NotBlank(message = "Address must not be blank")
    private String address;
}
