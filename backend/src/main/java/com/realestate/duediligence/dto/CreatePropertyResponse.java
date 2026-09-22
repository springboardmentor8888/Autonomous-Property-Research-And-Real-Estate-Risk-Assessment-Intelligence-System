package com.realestate.duediligence.dto;

import com.realestate.duediligence.entity.PropertyType;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Response returned after successfully creating a new property from
 * a validated address.
 */
@Data
@AllArgsConstructor
public class CreatePropertyResponse {
    private Long id;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private PropertyType propertyType;
}