package com.duedilligenceagent.backend.entities.enums;

import java.util.Arrays;

/**
 * Canonical property use types supported by the platform. Every
 * classifier in the search pipeline must resolve to one of these (or
 * null when genuinely unknown) so persisted values stay consistent
 * across strategies and search filters keep matching.
 */
public enum PropertyType {

    RESIDENTIAL("Residential"),
    COMMERCIAL("Commercial"),
    INDUSTRIAL("Industrial"),
    AGRICULTURAL("Agricultural"),
    MIXED_USE("Mixed Use"),
    LAND("Land");

    private final String label;

    PropertyType(String label) {
        this.label = label;
    }

    /** Human-readable value persisted and returned by the API. */
    public String getLabel() {
        return label;
    }

    /** Case/space/underscore-tolerant lookup for search filters. */
    public static PropertyType fromValue(String value) {
        if (value == null || value.isBlank()) return null;
        String norm = value.trim().toUpperCase().replace(' ', '_');
        return Arrays.stream(values())
                .filter(t -> t.name().equals(norm) || t.label.equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElse(null);
    }
}
