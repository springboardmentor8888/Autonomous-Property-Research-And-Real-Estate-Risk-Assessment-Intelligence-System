package com.duedilligenceagent.backend.dto.Property;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Internal representation of one external property listing (99acres via
 * Apify), returned as part of the property search result. This is the
 * application's own model — provider-specific shapes never leak here.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PropertyListing {

    private String listingId;
    private String title;
    private String propertyType;
    private String propertySubtype;
    private String bhk;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer balconies;
    private String carpetArea;
    private String superArea;
    private String areaText;
    private String sqm;
    private String price;
    private String pricePerSqft;
    private String originalPrice;
    private String originalCurrency;
    private String deposit;
    private String brokerage;
    private String furnishing;
    private String facing;
    private String floor;
    private Integer totalFloors;
    private String age;
    private String availability;
    private String transaction;
    private String source;
    private String locality;
    private String city;
    private Double latitude;
    private Double longitude;
    private String mapAccuracy;
    private String projectId;
    private String projectName;
    private String buildingId;
    private String buildingName;
    private String reraId;
    private String listedBy;
    private String dealer;
    private Boolean gatedCommunity;
    private Boolean verified;
    private List<String> amenities;
    private List<String> images;
    private String description;
    private String url;
    private String postingDate;
    private String updateDate;
    private String expiryDate;
}
