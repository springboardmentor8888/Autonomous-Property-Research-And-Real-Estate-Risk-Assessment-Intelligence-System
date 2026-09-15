package com.duedilligenceagent.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregationRequest {

    @NotBlank
    private String city;

    private String localityName;
    private String propertyType;
    private Integer bhk;
    private String transactionType;
    private Integer minPrice;
    private Integer maxPrice;
    private Integer limit;
}
