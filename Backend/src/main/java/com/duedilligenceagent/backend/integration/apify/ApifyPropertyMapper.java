package com.duedilligenceagent.backend.integration.apify;

import com.duedilligenceagent.backend.integration.apify.ApifyPropertyListing;
import com.duedilligenceagent.backend.dto.Property.PropertyListing;
import com.duedilligenceagent.backend.entities.ComparablePropertyDetails;
import com.duedilligenceagent.backend.integration.google.PropertyTypeClassifier;
import com.duedilligenceagent.backend.entities.Property;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

/**
 * Maps Apify 99acres external listing DTOs into the application's internal
 * models:
 * <ul>
 *   <li>{@link PropertyListing} — the API response model,</li>
 *   <li>{@link Property} enrichment — the best-matching listing's fields are
 *       persisted on the property_details row,</li>
 *   <li>{@link ComparablePropertyDetails} — every listing is persisted as a
 *       market comparable for the searched property.</li>
 * </ul>
 * <p>
 * All scalar fields of the external DTO are strings (source formats vary);
 * this mapper performs the lenient typed parsing.
 */
@Component
public class ApifyPropertyMapper {

    /**
     * External listing → internal response model. Raw values are echoed as
     * strings; counts / coordinates / flags are parsed.
     */
    public PropertyListing toListing(ApifyPropertyListing ext) {
        if (ext == null) {
            return null;
        }
        return PropertyListing.builder()
                .listingId(trim(ext.getListingId()))
                .title(trim(ext.getTitle()))
                .propertyType(trim(ext.getPropertyType()))
                .propertySubtype(trim(ext.getPropertySubtype()))
                .bhk(trim(ext.getBhk()))
                .bedrooms(parseInteger(ext.getBedrooms()))
                .bathrooms(parseInteger(ext.getBathrooms()))
                .balconies(parseInteger(ext.getBalconies()))
                .carpetArea(trim(ext.getCarpetArea()))
                .superArea(trim(ext.getSuperArea()))
                .areaText(trim(ext.getAreaText()))
                .sqm(trim(ext.getSqm()))
                .price(trim(ext.getPrice()))
                .pricePerSqft(trim(ext.getPricePerSqft()))
                .originalPrice(trim(ext.getOriginalPrice()))
                .originalCurrency(trim(ext.getOriginalCurrency()))
                .deposit(trim(ext.getDeposit()))
                .brokerage(trim(ext.getBrokerage()))
                .furnishing(trim(ext.getFurnishing()))
                .facing(trim(ext.getFacing()))
                .floor(trim(ext.getFloor()))
                .totalFloors(parseInteger(ext.getTotalFloors()))
                .age(trim(ext.getAge()))
                .availability(trim(ext.getAvailability()))
                .transaction(trim(ext.getTransaction()))
                .source(trim(ext.getSource()))
                .locality(trim(ext.getLocality()))
                .city(trim(ext.getCity()))
                .latitude(parseDouble(ext.getLatitude()))
                .longitude(parseDouble(ext.getLongitude()))
                .mapAccuracy(trim(ext.getMapAccuracy()))
                .projectId(trim(ext.getProjectId()))
                .projectName(trim(ext.getProjectName()))
                .buildingId(trim(ext.getBuildingId()))
                .buildingName(trim(ext.getBuildingName()))
                .reraId(trim(ext.getReraId()))
                .listedBy(trim(ext.getListedBy()))
                .dealer(trim(ext.getDealer()))
                .gatedCommunity(parseBoolean(ext.getGatedCommunity()))
                .verified(parseBoolean(ext.getVerified()))
                .amenities(ext.getAmenities())
                .images(ext.getImages())
                .description(trim(ext.getDescription()))
                .url(trim(ext.getUrl()))
                .postingDate(trim(ext.getPostingDate()))
                .updateDate(trim(ext.getUpdateDate()))
                .expiryDate(trim(ext.getExpiryDate()))
                .build();
    }

    /**
     * Enriches the persisted property row with the best-matching listing's
     * data. Only overwrites the address/location fields when the listing
     * carries a value; Google's validated address always wins for those.
     */
    public void enrichProperty(Property property, ApifyPropertyListing ext) {
        if (property == null || ext == null) {
            return;
        }
        property.setExternalListingId(trim(ext.getListingId()));
        property.setTitle(trim(ext.getTitle()));
        property.setPropertySubtype(trim(ext.getPropertySubtype()));
        property.setBedrooms(parseInteger(ext.getBedrooms()));
        property.setBathrooms(parseInteger(ext.getBathrooms()));
        property.setBalconies(parseInteger(ext.getBalconies()));
        property.setCarpetAreaSqft(parseBigDecimal(ext.getCarpetArea()));
        property.setSuperAreaSqft(parseBigDecimal(ext.getSuperArea()));
        property.setAreaText(trim(ext.getAreaText()));
        property.setSqm(parseBigDecimal(ext.getSqm()));
        property.setPrice(parseBigDecimal(ext.getPrice()));
        property.setPricePerSqft(parseBigDecimal(ext.getPricePerSqft()));
        property.setDeposit(parseBigDecimal(ext.getDeposit()));
        property.setBrokerage(parseBigDecimal(ext.getBrokerage()));
        property.setOriginalPrice(parseBigDecimal(ext.getOriginalPrice()));
        property.setOriginalCurrency(trim(ext.getOriginalCurrency()));
        property.setFurnishing(trim(ext.getFurnishing()));
        property.setFacing(trim(ext.getFacing()));
        property.setFloor(trim(ext.getFloor()));
        property.setTotalFloors(parseInteger(ext.getTotalFloors()));
        property.setAge(trim(ext.getAge()));
        property.setAvailability(trim(ext.getAvailability()));
        property.setTransaction(trim(ext.getTransaction()));
        property.setSource(trim(ext.getSource()));
        property.setReraId(trim(ext.getReraId()));
        property.setListedBy(trim(ext.getListedBy()));
        property.setDealer(trim(ext.getDealer()));
        property.setGatedCommunity(parseBoolean(ext.getGatedCommunity()));
        property.setVerified(parseBoolean(ext.getVerified()));
        property.setAmenities(join(ext.getAmenities()));
        property.setImages(join(ext.getImages()));
        property.setDescription(trim(ext.getDescription()));
        property.setListingUrl(trim(ext.getUrl()));
        property.setPostingDate(trim(ext.getPostingDate()));
        property.setUpdateDate(trim(ext.getUpdateDate()));
        property.setExpiryDate(trim(ext.getExpiryDate()));
        property.setMapAccuracy(trim(ext.getMapAccuracy()));

        // Refine the property type from the listing when Google left it undetermined
        if (property.getPropertyType() == null && ext.getPropertyType() != null) {
            String normalized = PropertyTypeClassifier.normalize(ext.getPropertyType());
            if (normalized == null) {
                normalized = classifyFromSubtype(ext.getPropertyType(), ext.getPropertySubtype());
            }
            property.setPropertyType(normalized);
        }
    }

    /**
     * External listing → comparable-property row for the searched property.
     */
    public ComparablePropertyDetails toComparable(Property property, ApifyPropertyListing ext) {
        if (ext == null) {
            return null;
        }
        return ComparablePropertyDetails.builder()
                .propertyId(property.getPropertyId())
                .externalListingId(trim(ext.getListingId()))
                .city(firstNonBlank(ext.getCity(), property.getCity()))
                .locality(trim(ext.getLocality()))
                .propertyType(firstNonBlank(
                        PropertyTypeClassifier.normalize(ext.getPropertyType()),
                        trim(ext.getPropertyType())))
                .bhk(firstNonBlank(ext.getBhk(),
                        ext.getBedrooms() == null ? null : ext.getBedrooms().trim() + " BHK"))
                .areaSqft(parseInteger(firstNonBlank(ext.getSuperArea(), ext.getCarpetArea())))
                .price(parseBigDecimal(ext.getPrice()))
                .pricePerSqft(parseBigDecimal(ext.getPricePerSqft()))
                .reraId(trim(ext.getReraId()))
                .floor(parseInteger(ext.getFloor()))
                .totalFloors(parseInteger(ext.getTotalFloors()))
                .handoffUrl(trim(ext.getUrl()))
                .verified(parseBoolean(ext.getVerified()))
                .source(firstNonBlank(trim(ext.getSource()), "99ACRES"))
                .retrievedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Best-effort classification from a source subtype string such as
     * "Residential Apartment" or "Commercial Office Space".
     */
    private String classifyFromSubtype(String propertyType, String propertySubtype) {
        String combined = ((propertyType == null ? "" : propertyType) + " "
                + (propertySubtype == null ? "" : propertySubtype)).toLowerCase(Locale.ROOT);
        if (combined.isBlank()) {
            return null;
        }
        if (combined.contains("residential") || combined.contains("apartment")
                || combined.contains("villa") || combined.contains("flat")
                || combined.contains("house") || combined.contains("floor")) {
            return com.duedilligenceagent.backend.entities.enums.PropertyType.RESIDENTIAL.getLabel();
        }
        if (combined.contains("commercial") || combined.contains("office")
                || combined.contains("shop") || combined.contains("retail")) {
            return com.duedilligenceagent.backend.entities.enums.PropertyType.COMMERCIAL.getLabel();
        }
        if (combined.contains("industrial") || combined.contains("warehouse")) {
            return com.duedilligenceagent.backend.entities.enums.PropertyType.INDUSTRIAL.getLabel();
        }
        if (combined.contains("farm") || combined.contains("agri")) {
            return com.duedilligenceagent.backend.entities.enums.PropertyType.AGRICULTURAL.getLabel();
        }
        if (combined.contains("plot") || combined.contains("land")) {
            return com.duedilligenceagent.backend.entities.enums.PropertyType.LAND.getLabel();
        }
        return null;
    }

    private static String join(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return String.join(", ", values);
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v.trim();
            }
        }
        return null;
    }

    private static String trim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    /** Lenient integer parse — "2", 2, "2.0" all work; anything else yields null. */
    static Integer parseInteger(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(value.trim()).setScale(0, RoundingMode.DOWN).intValueExact();
        } catch (NumberFormatException | ArithmeticException ex) {
            return null;
        }
    }

    /** Lenient decimal parse — strips currency symbols and thousands separators. */
    static BigDecimal parseBigDecimal(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String cleaned = value.trim()
                .replace("₹", "")
                .replace("Rs.", "")
                .replace("Rs", "")
                .replace("INR", "")
                .replace(",", "")
                .replace("/month", "")
                .trim();
        try {
            return new BigDecimal(cleaned);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    static Double parseDouble(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    /** Lenient boolean parse — accepts "true"/"1"/"yes" (any case). */
    static Boolean parseBoolean(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String v = value.trim().toLowerCase(Locale.ROOT);
        if ("true".equals(v) || "1".equals(v) || "yes".equals(v)) {
            return Boolean.TRUE;
        }
        if ("false".equals(v) || "0".equals(v) || "no".equals(v)) {
            return Boolean.FALSE;
        }
        return null;
    }
}
