package com.duedilligenceagent.backend.services;

import com.duedilligenceagent.backend.entities.enums.PropertyType;

import java.util.List;
import java.util.Locale;

/**
 * Single source of truth for classifying a geocoded place into a
 * {@link PropertyType}. Shared by the Geocoding and Places strategies
 * and services so every pipeline produces identical, enum-backed labels.
 */
public final class PropertyTypeClassifier {

    private PropertyTypeClassifier() {
    }

    /**
     * Coerce any incoming string (candidate value, request param, legacy
     * data) into a supported {@link PropertyType} label, or null if it
     * does not map. Guarantees the persisted value is always enum-backed.
     */
    public static String normalize(String raw) {
        PropertyType t = PropertyType.fromValue(raw);
        return t == null ? null : t.getLabel();
    }

    /**
     * Google Geocoding {@code types} are match-granularity tags
     * (e.g. establishment, point_of_interest, premise, street_address,
     * route...). Order of checks matters: a business premises carries
     * both POI and address types.
     */
    public static String fromGeocodingTypes(List<String> types) {
        if (types == null || types.isEmpty()) return null;

        boolean poi = types.contains("establishment") || types.contains("point_of_interest");
        if (poi) {
            // POI category hints can refine commercial vs mixed/residential
            if (types.contains("shopping_mall") || types.contains("store")
                    || types.contains("office") || types.contains("bank")
                    || types.contains("restaurant") || types.contains("lodging")) {
                return PropertyType.COMMERCIAL.getLabel();
            }
            if (types.contains("housing_complex") || types.contains("apartment")) {
                return PropertyType.RESIDENTIAL.getLabel();
            }
            if (types.contains("premise") || types.contains("subpremise")) {
                return PropertyType.RESIDENTIAL.getLabel();
            }
            return PropertyType.COMMERCIAL.getLabel();
        }

        // Pure address results: a physical premise or an explicit house
        // number is a built property — residential is the best inference.
        if (types.contains("premise") || types.contains("subpremise")
                || types.contains("street_address")) {
            return PropertyType.RESIDENTIAL.getLabel();
        }

        // route / locality / sublocality / postal etc. describe areas or
        // roads, not a specific property — leave undetermined so Places
        // enrichment can classify it.
        return null;
    }

    /**
     * Google Places (New) {@code primaryType} + legacy {@code types}.
     * The old blanket establishment/point_of_interest fallback is
     * removed: every place carries those, which classified everything
     * as Commercial.
     */
    public static String fromPlaces(String primaryType, List<String> types) {
        String p = primaryType == null ? null : primaryType.toLowerCase(Locale.ROOT);

        if (p != null) {
            if (p.startsWith("residential") || p.contains("apartment")
                    || p.contains("condominium") || p.contains("housing")
                    || p.contains("gated_community") || p.contains("dwelling")) {
                return PropertyType.RESIDENTIAL.getLabel();
            }
            if (p.contains("warehouse") || p.contains("factory")
                    || p.contains("industrial") || p.contains("logistics")
                    || p.contains("manufacture")) {
                return PropertyType.INDUSTRIAL.getLabel();
            }
            if (p.contains("farm") || p.contains("ranch") || p.contains("plantation")
                    || p.contains("orchard") || p.contains("greenhouse")
                    || p.contains("vineyard")) {
                return PropertyType.AGRICULTURAL.getLabel();
            }
            if (p.contains("mixed_use")) {
                return PropertyType.MIXED_USE.getLabel();
            }
            if (p.contains("office") || p.contains("commercial") || p.contains("mall")
                    || p.contains("store") || p.contains("retail") || p.contains("market")
                    || p.contains("restaurant") || p.contains("lodging") || p.contains("hotel")
                    || p.contains("bank") || p.contains("hospital") || p.contains("parking")) {
                return PropertyType.COMMERCIAL.getLabel();
            }
            // "route", "locality", "country", "intl_address" etc.: not a property.
        }

        if (types != null) {
            if (types.contains("residential") || types.contains("apartment_complex")
                    || types.contains("condominium")) {
                return PropertyType.RESIDENTIAL.getLabel();
            }
            if (types.contains("industrial") || types.contains("warehouse")) {
                return PropertyType.INDUSTRIAL.getLabel();
            }
            if (types.contains("farm") || types.contains("ranch")) {
                return PropertyType.AGRICULTURAL.getLabel();
            }
            if (types.contains("office") || types.contains("store")
                    || types.contains("shopping_mall") || types.contains("restaurant")) {
                return PropertyType.COMMERCIAL.getLabel();
            }
        }

        return null;
    }
}
