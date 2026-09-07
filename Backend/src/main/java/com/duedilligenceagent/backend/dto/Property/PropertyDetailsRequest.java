package com.duedilligenceagent.backend.dto.Property;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Inbound payload sent by the frontend when a user searches a property by
 * address. Sent to {@code POST /api/properties/search} and forwarded to
 * Mappls for address validation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDetailsRequest {

    /** Free-form address text typed by the user (e.g. "23, MG Road, Bengaluru"). */
    @NotBlank(message = "address must not be blank")
    @Size(max = 500, message = "address must be at most 500 characters")
    private String address;

    /** Optional owner-supplied property metadata — not required to search. */
    private String propertyName;

    private String propertyType;
}
