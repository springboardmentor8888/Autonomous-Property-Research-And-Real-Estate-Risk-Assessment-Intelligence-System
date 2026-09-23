package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A validated property snapshot (address-validated search result, enriched
 * with provider listing data).
 * <p>
 * Address and validation fields come from the Google Address Validation API;
 * the listing fields (title, price, BHK, area, furnishing, RERA, ...) are
 * enriched from the best-matching external property listing (Apify 99acres).
 * {@code propertyType} holds one of the six
 * {@link com.duedilligenceagent.backend.entities.enums.PropertyType} labels,
 * or null when the type could not be determined with confidence.
 */
@Entity
@Table(name = "property_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    /** Neighborhood / sublocality resolved for the address. */
    @Column(name = "locality", length = 150)
    private String locality;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "property_type", length = 50)
    private String propertyType;

    @Column(name = "google_place_id", length = 150)
    private String googlePlaceId;

    @Column(name = "validation_granularity", length = 40)
    private String validationGranularity;

    @Column(name = "geocode_granularity", length = 40)
    private String geocodeGranularity;

    @Column(name = "address_complete")
    private Boolean addressComplete;

    /** True when Google could not confirm every address component. */
    @Column(name = "has_unconfirmed_components")
    private Boolean hasUnconfirmedComponents;

    /** Suggested follow-up action from the Google Address Validation API. */
    @Column(name = "possible_next_action", length = 100)
    private String possibleNextAction;

    /** Google place types of the geocoded result, comma-joined. */
    @Column(name = "place_types", length = 255)
    private String placeTypes;

    /** Plus code (global) for the resolved location. */
    @Column(name = "plus_code", length = 30)
    private String plusCode;

    /** Address Validation response id — required for validation feedback calls. */
    @Column(name = "google_response_id", length = 100)
    private String googleResponseId;

    @Column(name = "government_identifier", length = 150)
    private String governmentIdentifier;

    @Column(name = "municipal_assessment_identifier", length = 150)
    private String municipalAssessmentIdentifier;

    // --- Enrichment from the best-matching external listing (Apify 99acres) ---

    /** External listing id (e.g. 99acres listing id). */
    @Column(name = "external_listing_id", length = 100)
    private String externalListingId;

    @Column(name = "title", length = 500)
    private String title;

    /** Source-specific subtype (e.g. "Residential Apartment"). */
    @Column(name = "property_subtype", length = 100)
    private String propertySubtype;

    @Column(name = "bedrooms")
    private Integer bedrooms;

    @Column(name = "bathrooms")
    private Integer bathrooms;

    @Column(name = "balconies")
    private Integer balconies;

    @Column(name = "carpet_area_sqft", precision = 10, scale = 2)
    private BigDecimal carpetAreaSqft;

    @Column(name = "super_area_sqft", precision = 10, scale = 2)
    private BigDecimal superAreaSqft;

    /** Raw area label as published by the source (e.g. "1,250 sqft"). */
    @Column(name = "area_text", length = 100)
    private String areaText;

    /** Area in square meters, when the source reports it. */
    @Column(name = "sqm", precision = 10, scale = 2)
    private BigDecimal sqm;

    @Column(name = "price", precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "price_per_sqft", precision = 10, scale = 2)
    private BigDecimal pricePerSqft;

    @Column(name = "deposit", precision = 15, scale = 2)
    private BigDecimal deposit;

    @Column(name = "brokerage", precision = 15, scale = 2)
    private BigDecimal brokerage;

    /** Original price as published (before normalization), when reported. */
    @Column(name = "original_price", precision = 15, scale = 2)
    private BigDecimal originalPrice;

    /** Currency of the original price (e.g. INR). */
    @Column(name = "original_currency", length = 10)
    private String originalCurrency;

    @Column(name = "furnishing", length = 50)
    private String furnishing;

    @Column(name = "facing", length = 50)
    private String facing;

    @Column(name = "floor", length = 20)
    private String floor;

    @Column(name = "total_floors")
    private Integer totalFloors;

    /** Age bracket as published (e.g. "0-1 years", "New Construction"). */
    @Column(name = "age", length = 50)
    private String age;

    @Column(name = "availability", length = 50)
    private String availability;

    /** Sale / Rent / PG transaction of the matched listing. */
    @Column(name = "transaction", length = 30)
    private String transaction;

    /** Data source of the matched listing (e.g. 99ACRES). */
    @Column(name = "source", length = 50)
    private String source;

    /** RERA registration code of the matched listing/project. */
    @Column(name = "rera_id", length = 100)
    private String reraId;

    /** owner / agent / builder. */
    @Column(name = "listed_by", length = 30)
    private String listedBy;

    /** Dealer / agent name. */
    @Column(name = "dealer", length = 150)
    private String dealer;

    @Column(name = "gated_community")
    private Boolean gatedCommunity;

    @Column(name = "verified")
    private Boolean verified;

    /** Amenity names, comma-joined. */
    @Column(name = "amenities", length = 4000)
    private String amenities;

    @Lob
    @Column(name = "images")
    private String images;

    @Lob
    @Column(name = "description")
    private String description;

    /** Canonical listing URL on the source portal. */
    @Column(name = "listing_url", length = 1000)
    private String listingUrl;

    /** Listing dates as published by the source (format varies by provider). */
    @Column(name = "posting_date", length = 50)
    private String postingDate;

    @Column(name = "update_date", length = 50)
    private String updateDate;

    @Column(name = "expiry_date", length = 50)
    private String expiryDate;

    /** Map accuracy of the listing coordinates (e.g. exact, locality-level). */
    @Column(name = "map_accuracy", length = 30)
    private String mapAccuracy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}