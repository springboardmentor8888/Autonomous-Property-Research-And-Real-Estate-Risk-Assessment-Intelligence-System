package com.duedilligenceagent.backend.dto.Google;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * External request model for the Google Address Validation API
 * ({@code POST /v1:validateAddress}).
 * <p>
 * Provider-specific shape — never exposed to the internal domain. Built by
 * {@link com.duedilligenceagent.backend.services.GoogleAddressValidationStrategy}
 * from the application's structured address input.
 *
 * @see <a href="https://developers.google.com/maps/documentation/address-validation/reference/rest/v1/validateAddress">Address Validation API reference</a>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GoogleAddressValidationRequest {

    private PostalAddress address;

    /**
     * Google {@code PostalAddress} — only the fields relevant for Indian
     * structured address validation are populated.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PostalAddress {

        /** CLDR region code, always {@code "IN"} for this system. */
        private String regionCode;

        /** State — maps to Google's top-level administrative area. */
        private String administrativeArea;

        /** City / town. */
        private String locality;

        /** PIN code, when the user supplied one. */
        private String postalCode;

        /** Premise-level address text (address line, house/plot, building, street, locality). */
        private List<String> addressLines;
    }
}
