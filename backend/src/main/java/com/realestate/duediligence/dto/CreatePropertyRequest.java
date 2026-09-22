package com.realestate.duediligence.dto;

import lombok.Data;

/**
 * Request body for creating a new property from a raw address.
 * The address will be validated (via Geoapify) before being saved.
 */
@Data
public class CreatePropertyRequest {

    private String address;

    // Optional — defaults to RESIDENTIAL if not provided.
    private String propertyType;
}