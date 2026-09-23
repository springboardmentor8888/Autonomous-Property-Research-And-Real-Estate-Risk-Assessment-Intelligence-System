package com.duedilligenceagent.backend.dto.Apify;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * External response model for one property listing returned by the Apify
 * 99acres actor (dataset item).
 * <p>
 * Field names follow the observed actor output (snake_case) with aliases for
 * the camelCase / uppercase variants seen across actor versions. All scalar
 * fields are {@code String} so numeric or textual variants from the source
 * never break deserialization — typed parsing happens in
 * {@link com.duedilligenceagent.backend.services.ApifyPropertyMapper}.
 * <p>
 * Provider-specific shape — never exposed to the internal domain.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApifyPropertyListing {

    @JsonProperty("listing_id")
    @JsonAlias({"listingId", "listingID"})
    private String listingId;

    private String title;

    @JsonProperty("property_type")
    @JsonAlias({"propertyType"})
    private String propertyType;

    @JsonProperty("property_subtype")
    @JsonAlias({"propertySubtype"})
    private String propertySubtype;

    @JsonProperty("bhk")
    @JsonAlias({"BHK", "bhkText"})
    private String bhk;

    private String bedrooms;
    private String bathrooms;
    private String balconies;

    @JsonProperty("carpet_area")
    @JsonAlias({"carpet_area_sqft", "carpetArea", "carpetAreaSqft"})
    private String carpetArea;

    @JsonProperty("super_area")
    @JsonAlias({"super_area_sqft", "superArea", "superAreaSqft", "builtup_area", "builtup_area_sqft"})
    private String superArea;

    @JsonProperty("area_text")
    @JsonAlias({"areaText", "area"})
    private String areaText;

    private String price;

    @JsonProperty("price_per_sqft")
    @JsonAlias({"pricePerSqft", "price_per_sqft_inr"})
    private String pricePerSqft;

    private String deposit;

    private String brokerage;

    @JsonProperty("original_price")
    @JsonAlias({"originalPrice"})
    private String originalPrice;

    @JsonProperty("original_currency")
    @JsonAlias({"originalCurrency"})
    private String originalCurrency;

    private String sqm;

    private String furnishing;
    private String facing;
    private String floor;

    @JsonProperty("total_floors")
    @JsonAlias({"totalFloors"})
    private String totalFloors;

    @JsonAlias({"age_of_property", "ageOfProperty"})
    private String age;

    private String availability;

    @JsonAlias({"transactionType", "transaction_type", "searchMode"})
    private String transaction;

    private String source;

    private String locality;
    private String city;

    private String latitude;
    private String longitude;

    @JsonProperty("map_accuracy")
    @JsonAlias({"mapAccuracy"})
    private String mapAccuracy;

    @JsonProperty("project_id")
    @JsonAlias({"projectId"})
    private String projectId;

    @JsonProperty("project_name")
    @JsonAlias({"projectName"})
    private String projectName;

    @JsonProperty("building_id")
    @JsonAlias({"buildingId"})
    private String buildingId;

    @JsonProperty("building_name")
    @JsonAlias({"buildingName"})
    private String buildingName;

    @JsonProperty("rera_id")
    @JsonAlias({"RERA ID", "RERA_ID", "reraId", "rera"})
    private String reraId;

    @JsonProperty("listed_by")
    @JsonAlias({"listedBy"})
    private String listedBy;

    @JsonAlias({"dealer_name", "dealerName"})
    private String dealer;

    @JsonProperty("gated_community")
    @JsonAlias({"gatedCommunity"})
    private String gatedCommunity;

    private String verified;

    @JsonFormat(with = JsonFormat.Feature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
    private List<String> amenities;

    @JsonFormat(with = JsonFormat.Feature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
    private List<String> images;

    private String description;

    @JsonProperty("url")
    @JsonAlias({"URL", "listing_url", "listingUrl"})
    private String url;

    @JsonProperty("posting_date")
    @JsonAlias({"posted_at", "postedDate", "posted_at"})
    private String postingDate;

    @JsonProperty("update_date")
    @JsonAlias({"updated_at", "updatedDate", "updated_at"})
    private String updateDate;

    @JsonProperty("expiry_date")
    @JsonAlias({"expiryDate"})
    private String expiryDate;
}
