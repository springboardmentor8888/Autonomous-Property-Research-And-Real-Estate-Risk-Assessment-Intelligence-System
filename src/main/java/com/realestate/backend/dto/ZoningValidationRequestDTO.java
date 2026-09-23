package com.realestate.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoningValidationRequestDTO {

    @NotNull(message = "Zoning information is required")
    private ZoningInfoDTO zoningInfo;

    @NotBlank(message = "Property type is required")
    private String propertyType;
}
