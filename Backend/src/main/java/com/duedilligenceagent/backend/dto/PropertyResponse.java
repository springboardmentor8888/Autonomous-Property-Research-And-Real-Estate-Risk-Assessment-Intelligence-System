package com.duedilligenceagent.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

/**
 * A property record as returned by the CRUD endpoints
 * ({@code GET /api/properties}, {@code GET /api/properties/{id}}).
 * <p>
 * Carries the Google-validated address data plus the enrichment from the
 * best-matching external listing (Apify 99acres).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PropertyResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long propertyId;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String propertyType;

    // Address validation data
    private String locality;
    private String googlePlaceId;
    private String validationGranularity;
    private String geocodeGranularity;
    private Boolean addressComplete;
    private Boolean hasUnconfirmedComponents;
    private String possibleNextAction;
    private List<String> placeTypes;
    private String plusCode;

    // Enrichment from the best-matching external listing
    private String externalListingId;
    private String title;
    private String propertySubtype;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer balconies;
    private BigDecimal carpetAreaSqft;
    private BigDecimal superAreaSqft;
    private String areaText;
    private BigDecimal sqm;
    private BigDecimal price;
    private BigDecimal pricePerSqft;
    private BigDecimal deposit;
    private BigDecimal brokerage;
    private BigDecimal originalPrice;
    private String originalCurrency;
    private String furnishing;
    private String facing;
    private String floor;
    private Integer totalFloors;
    private String age;
    private String availability;
    private String transaction;
    private String source;
    private String reraId;
    private String listedBy;
    private String dealer;
    private Boolean gatedCommunity;
    private Boolean verified;
    private List<String> amenities;
    private List<String> images;
    private String description;
    private String listingUrl;
    private String postingDate;
    private String updateDate;
    private String expiryDate;
    private String mapAccuracy;

    /** Splits a comma-joined column value into a list (null-safe). */
    public static List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    /** Joins a list into a comma-separated column value (null-safe). */
    public static String joinCsv(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return String.join(",", values);
    }
}
