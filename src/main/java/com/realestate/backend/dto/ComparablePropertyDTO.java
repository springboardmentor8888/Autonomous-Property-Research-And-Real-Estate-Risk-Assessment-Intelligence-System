package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparablePropertyDTO {
    private Long id;
    private String title;
    private String address;
    private String city;
    private BigDecimal price;
    private Double squareFeet;
    private BigDecimal pricePerSqFt;
    private Integer bedrooms;
    private Integer bathrooms;
    private String propertyType;
    private Double similarityScore; // 0 to 100%
    private String correlationNote;
}
