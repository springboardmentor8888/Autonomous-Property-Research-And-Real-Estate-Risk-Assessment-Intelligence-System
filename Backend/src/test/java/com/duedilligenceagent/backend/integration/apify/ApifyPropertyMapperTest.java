package com.duedilligenceagent.backend.integration.apify;

import com.duedilligenceagent.backend.integration.apify.ApifyPropertyListing;
import com.duedilligenceagent.backend.dto.Property.PropertyListing;
import com.duedilligenceagent.backend.entities.ComparablePropertyDetails;
import com.duedilligenceagent.backend.entities.Property;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies the Apify 99acres external DTO deserialization (observed field
 * names + aliases) and the mapping into the internal models.
 */
class ApifyPropertyMapperTest {

    private final ApifyPropertyMapper mapper = new ApifyPropertyMapper();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /** Payload using the exact observed field names from the tested actor. */
    private static final String OBSERVED_PAYLOAD = """
            {
              "listing_id": "R12345678",
              "title": "2 BHK Apartment for Sale in Koramangala",
              "property_type": "Residential Apartment",
              "BHK": "2 BHK",
              "bedrooms": 2,
              "bathrooms": 2,
              "balconies": 1,
              "carpet_area": 1050,
              "super_area": 1250,
              "area_text": "1,250 sqft",
              "price": 4200000,
              "price_per_sqft": 3360,
              "deposit": 168000,
              "brokerage": 0,
              "furnishing": "Semi-Furnished",
              "facing": "East",
              "floor": "4",
              "total_floors": 8,
              "age": "0-1 years",
              "availability": "Ready to move",
              "locality": "Koramangala",
              "city": "Bangalore",
              "latitude": 12.9352,
              "longitude": 77.6245,
              "map_accuracy": "exact",
              "project_id": "P9876",
              "building_id": "B5432",
              "RERA ID": "PRM/KA/RERA/1251/446/PR/171014/000456",
              "listed_by": "agent",
              "dealer": "Urban Homes Realty",
              "gated_community": true,
              "verified": true,
              "amenities": ["Gym", "Club House", "Covered Car Parking"],
              "images": ["https://images.99acres.com/a.jpg", "https://images.99acres.com/b.jpg"],
              "description": "Spacious 2 BHK semi-furnished apartment.",
              "URL": "https://www.99acres.com/2-bhk-apartment-koramangala-r12345678",
              "posting_date": "2026-04-14",
              "update_date": "2026-04-20",
              "expiry_date": "2026-07-14",
              "transaction": "buy",
              "source": "99ACRES",
              "original_price": 4500000,
              "original_currency": "INR",
              "sqm": 116.13,
              "property_subtype": "Apartment"
            }
            """;

    private ApifyPropertyListing deserialize() throws Exception {
        return objectMapper.readValue(OBSERVED_PAYLOAD, ApifyPropertyListing.class);
    }

    @Test
    void deserializesAllObservedFields() throws Exception {
        ApifyPropertyListing ext = deserialize();

        assertThat(ext.getListingId()).isEqualTo("R12345678");
        assertThat(ext.getTitle()).isEqualTo("2 BHK Apartment for Sale in Koramangala");
        assertThat(ext.getPropertyType()).isEqualTo("Residential Apartment");
        assertThat(ext.getBhk()).isEqualTo("2 BHK");
        assertThat(ext.getBedrooms()).isEqualTo("2");
        assertThat(ext.getCarpetArea()).isEqualTo("1050");
        assertThat(ext.getSuperArea()).isEqualTo("1250");
        assertThat(ext.getAreaText()).isEqualTo("1,250 sqft");
        assertThat(ext.getPrice()).isEqualTo("4200000");
        assertThat(ext.getPricePerSqft()).isEqualTo("3360");
        assertThat(ext.getReraId()).isEqualTo("PRM/KA/RERA/1251/446/PR/171014/000456");
        assertThat(ext.getUrl()).isEqualTo("https://www.99acres.com/2-bhk-apartment-koramangala-r12345678");
        assertThat(ext.getGatedCommunity()).isEqualTo("true");
        assertThat(ext.getAmenities()).containsExactly("Gym", "Club House", "Covered Car Parking");
        assertThat(ext.getImages()).hasSize(2);
        assertThat(ext.getTransaction()).isEqualTo("buy");
        assertThat(ext.getSource()).isEqualTo("99ACRES");
        assertThat(ext.getOriginalPrice()).isEqualTo("4500000");
        assertThat(ext.getOriginalCurrency()).isEqualTo("INR");
        assertThat(ext.getSqm()).isEqualTo("116.13");
        assertThat(ext.getPropertySubtype()).isEqualTo("Apartment");
        assertThat(ext.getPostingDate()).isEqualTo("2026-04-14");
        assertThat(ext.getExpiryDate()).isEqualTo("2026-07-14");
        assertThat(ext.getMapAccuracy()).isEqualTo("exact");
    }

    @Test
    void deserializesCamelCaseAliases() throws Exception {
        String payload = """
                {
                  "listingId": "X1",
                  "propertyType": "Villa",
                  "bhk": "3 BHK",
                  "carpetArea": "1400",
                  "reraId": "PRM/KA/RERA/1",
                  "dealerName": "Some Dealer",
                  "gatedCommunity": "false",
                  "url": "https://www.99acres.com/x1",
                  "posted_at": "2026-01-01",
                  "searchMode": "rent"
                }
                """;
        ApifyPropertyListing ext = objectMapper.readValue(payload, ApifyPropertyListing.class);

        assertThat(ext.getListingId()).isEqualTo("X1");
        assertThat(ext.getPropertyType()).isEqualTo("Villa");
        assertThat(ext.getBhk()).isEqualTo("3 BHK");
        assertThat(ext.getCarpetArea()).isEqualTo("1400");
        assertThat(ext.getReraId()).isEqualTo("PRM/KA/RERA/1");
        assertThat(ext.getDealer()).isEqualTo("Some Dealer");
        assertThat(ext.getGatedCommunity()).isEqualTo("false");
        assertThat(ext.getUrl()).isEqualTo("https://www.99acres.com/x1");
        assertThat(ext.getPostingDate()).isEqualTo("2026-01-01");
        assertThat(ext.getTransaction()).isEqualTo("rent");
    }

    @Test
    void ignoresUnknownFieldsAndMissingFields() throws Exception {
        String payload = """
                {"listing_id": "Y1", "some_future_field": {"nested": 1}}
                """;
        ApifyPropertyListing ext = objectMapper.readValue(payload, ApifyPropertyListing.class);

        assertThat(ext.getListingId()).isEqualTo("Y1");
        assertThat(ext.getTitle()).isNull();
        assertThat(ext.getAmenities()).isNull();
    }

    @Test
    void mapsToListingWithParsedTypes() throws Exception {
        PropertyListing listing = mapper.toListing(deserialize());

        assertThat(listing.getListingId()).isEqualTo("R12345678");
        assertThat(listing.getBedrooms()).isEqualTo(2);
        assertThat(listing.getBathrooms()).isEqualTo(2);
        assertThat(listing.getBalconies()).isEqualTo(1);
        assertThat(listing.getTotalFloors()).isEqualTo(8);
        assertThat(listing.getLatitude()).isEqualTo(12.9352);
        assertThat(listing.getLongitude()).isEqualTo(77.6245);
        assertThat(listing.getGatedCommunity()).isTrue();
        assertThat(listing.getVerified()).isTrue();
        assertThat(listing.getAmenities()).hasSize(3);
        assertThat(listing.getReraId()).startsWith("PRM/KA/RERA");
        assertThat(listing.getPrice()).isEqualTo("4200000");
    }

    @Test
    void enrichesPropertyWithParsedColumns() throws Exception {
        Property property = Property.builder()
                .address("addr").city("Bangalore").state("Karnataka")
                .build();
        mapper.enrichProperty(property, deserialize());

        assertThat(property.getExternalListingId()).isEqualTo("R12345678");
        assertThat(property.getTitle()).contains("Koramangala");
        assertThat(property.getBedrooms()).isEqualTo(2);
        assertThat(property.getCarpetAreaSqft()).isEqualByComparingTo(new BigDecimal("1050"));
        assertThat(property.getSuperAreaSqft()).isEqualByComparingTo(new BigDecimal("1250"));
        assertThat(property.getPrice()).isEqualByComparingTo(new BigDecimal("4200000"));
        assertThat(property.getPricePerSqft()).isEqualByComparingTo(new BigDecimal("3360"));
        assertThat(property.getDeposit()).isEqualByComparingTo(new BigDecimal("168000"));
        assertThat(property.getOriginalPrice()).isEqualByComparingTo(new BigDecimal("4500000"));
        assertThat(property.getOriginalCurrency()).isEqualTo("INR");
        assertThat(property.getSqm()).isEqualByComparingTo(new BigDecimal("116.13"));
        assertThat(property.getReraId()).startsWith("PRM/KA/RERA");
        assertThat(property.getGatedCommunity()).isTrue();
        assertThat(property.getVerified()).isTrue();
        assertThat(property.getAmenities()).isEqualTo("Gym, Club House, Covered Car Parking");
        assertThat(property.getListingUrl()).contains("99acres.com");
        assertThat(property.getTransaction()).isEqualTo("buy");
        assertThat(property.getSource()).isEqualTo("99ACRES");
        // Google's validated address fields are never overwritten by the listing
        assertThat(property.getAddress()).isEqualTo("addr");
        assertThat(property.getCity()).isEqualTo("Bangalore");
    }

    @Test
    void enrichPropertyClassifiesTypeWhenGoogleLeftItNull() throws Exception {
        Property property = Property.builder()
                .address("addr").city("Bangalore").state("Karnataka")
                .propertyType(null)
                .build();
        mapper.enrichProperty(property, deserialize());

        assertThat(property.getPropertyType()).isEqualTo("Residential");
    }

    @Test
    void mapsToComparable() throws Exception {
        Property property = Property.builder()
                .propertyId(42L).address("addr").city("Bangalore").state("Karnataka")
                .build();
        ComparablePropertyDetails comparable = mapper.toComparable(property, deserialize());

        assertThat(comparable).isNotNull();
        assertThat(comparable.getPropertyId()).isEqualTo(42L);
        assertThat(comparable.getExternalListingId()).isEqualTo("R12345678");
        assertThat(comparable.getCity()).isEqualTo("Bangalore");
        assertThat(comparable.getLocality()).isEqualTo("Koramangala");
        assertThat(comparable.getBhk()).isEqualTo("2 BHK");
        assertThat(comparable.getAreaSqft()).isEqualTo(1250);
        assertThat(comparable.getPrice()).isEqualByComparingTo(new BigDecimal("4200000"));
        assertThat(comparable.getReraId()).startsWith("PRM/KA/RERA");
        assertThat(comparable.getVerified()).isTrue();
        assertThat(comparable.getSource()).isEqualTo("99ACRES");
        assertThat(comparable.getHandoffUrl()).contains("99acres.com");
        assertThat(comparable.getRetrievedAt()).isNotNull();
    }

    @Test
    void lenientParsingHandlesMessyValues() {
        assertThat(ApifyPropertyMapper.parseBigDecimal("₹42,000/month")).isEqualByComparingTo(new BigDecimal("42000"));
        assertThat(ApifyPropertyMapper.parseBigDecimal("Rs. 1,02,34,567")).isEqualByComparingTo(new BigDecimal("10234567"));
        assertThat(ApifyPropertyMapper.parseBigDecimal("Price on request")).isNull();
        assertThat(ApifyPropertyMapper.parseInteger("2")).isEqualTo(2);
        assertThat(ApifyPropertyMapper.parseInteger("2.0")).isEqualTo(2);
        assertThat(ApifyPropertyMapper.parseInteger("2 BHK")).isNull();
        assertThat(ApifyPropertyMapper.parseDouble("12.9352")).isEqualTo(12.9352);
        assertThat(ApifyPropertyMapper.parseBoolean("TRUE")).isTrue();
        assertThat(ApifyPropertyMapper.parseBoolean("0")).isFalse();
        assertThat(ApifyPropertyMapper.parseBoolean("maybe")).isNull();
    }

    @Test
    void toListingAndComparableReturnNullForNullInput() {
        assertThat(mapper.toListing(null)).isNull();
        assertThat(mapper.toComparable(new Property(), null)).isNull();
    }
}
