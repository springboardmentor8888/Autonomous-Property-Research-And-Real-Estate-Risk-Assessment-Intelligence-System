package com.duedilligenceagent.backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PropertyResponse {

    private Long propertyId;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String propertyType;
}