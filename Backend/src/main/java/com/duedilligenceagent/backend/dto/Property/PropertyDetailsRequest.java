package com.duedilligenceagent.backend.dto.Property;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Inbound payload sent by the frontend when a user searches a property by
 * address. Sent to {@code POST /api/properties/search}.
 * 
 * Supports structured address input for precise geocoding:
 * - Required: address (primary line), city, state
 * - Optional: pincode, house/flat/plot, building/society, street/road, locality
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDetailsRequest {

    /** Primary address line - required (e.g. "23, MG Road" or a landmark) */
    @NotBlank(message = "address must not be blank")
    @Size(max = 500, message = "address must be at most 500 characters")
    private String address;

    /** City - required */
    @NotBlank(message = "city must not be blank")
    @Size(max = 100, message = "city must be at most 100 characters")
    private String city;

    /** State - required */
    @NotBlank(message = "state must not be blank")
    @Size(max = 100, message = "state must be at most 100 characters")
    private String state;

    /** PIN code - optional */
    @Size(max = 10, message = "pincode must be at most 10 characters")
    private String pincode;

    /** House/Flat/Plot number - optional */
    @Size(max = 100, message = "houseFlatPlot must be at most 100 characters")
    private String houseFlatPlot;

    /** Building/Society name - optional */
    @Size(max = 150, message = "buildingSociety must be at most 150 characters")
    private String buildingSociety;

    /** Street/Road name - optional */
    @Size(max = 150, message = "streetRoad must be at most 150 characters")
    private String streetRoad;

    /** Locality/Area - optional */
    @Size(max = 150, message = "locality must be at most 150 characters")
    private String locality;
}
