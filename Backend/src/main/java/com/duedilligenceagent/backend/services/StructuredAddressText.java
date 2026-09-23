package com.duedilligenceagent.backend.services;

import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;

import java.util.ArrayList;
import java.util.List;

/**
 * Assembles address text from the structured address input, shared by the
 * address validation strategies and the search orchestration.
 * <p>
 * Deduplication: the primary address line is split on commas and any
 * sub-segment already covered by a structured field (case-insensitive)
 * is dropped, so content typed both in the address line and a structured
 * field is not sent twice to the provider.
 */
public final class StructuredAddressText {

    private StructuredAddressText() {
    }

    /**
     * Full single-line address: address line, house/flat/plot, building/society,
     * street/road, locality, city, state, pincode (space-appended).
     */
    public static String fullAddress(PropertyDetailsRequest request) {
        List<String> structured = structuredParts(request);

        String addressLine = dedupeAddressLine(request.getAddress(), structured);

        List<String> parts = new ArrayList<>();
        if (addressLine != null && !addressLine.isBlank()) {
            parts.add(addressLine);
        }
        parts.addAll(structured);

        StringBuilder sb = new StringBuilder(String.join(", ", parts));

        if (request.getPincode() != null && !request.getPincode().isBlank() && sb.length() > 0) {
            sb.append(" ").append(request.getPincode().trim());
        }

        return sb.toString();
    }

    /**
     * Premise-level address text only (address line, house/flat/plot,
     * building/society, street/road, locality) — the parts that do not have
     * a dedicated structured field in Google's PostalAddress. Used as the
     * {@code addressLines} entry for the Address Validation API.
     */
    public static String premiseLine(PropertyDetailsRequest request) {
        List<String> structured = new ArrayList<>();
        addPart(structured, request.getHouseFlatPlot());
        addPart(structured, request.getBuildingSociety());
        addPart(structured, request.getStreetRoad());
        addPart(structured, request.getLocality());

        String addressLine = dedupeAddressLine(request.getAddress(), structured);

        List<String> parts = new ArrayList<>();
        if (addressLine != null && !addressLine.isBlank()) {
            parts.add(addressLine);
        }
        parts.addAll(structured);

        return String.join(", ", parts);
    }

    /**
     * City / state / pincode-bearing structured parts, deduplicated.
     */
    private static List<String> structuredParts(PropertyDetailsRequest request) {
        List<String> structured = new ArrayList<>();
        addPart(structured, request.getHouseFlatPlot());
        addPart(structured, request.getBuildingSociety());
        addPart(structured, request.getStreetRoad());
        addPart(structured, request.getLocality());
        addPart(structured, request.getCity());
        addPart(structured, request.getState());
        return structured;
    }

    /**
     * Splits the primary address line on commas and drops any sub-segment
     * that duplicates (case-insensitive) a structured field. Returns null
     * when nothing remains.
     */
    private static String dedupeAddressLine(String address, List<String> structured) {
        if (address == null || address.isBlank()) {
            return null;
        }
        StringBuilder kept = new StringBuilder();
        for (String segment : address.split(",")) {
            String trimmed = segment.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            boolean covered = structured.stream()
                    .anyMatch(s -> s.equalsIgnoreCase(trimmed));
            if (!covered) {
                if (kept.length() > 0) {
                    kept.append(", ");
                }
                kept.append(trimmed);
            }
        }
        return kept.toString();
    }

    /**
     * Appends a trimmed part unless it is blank or already present
     * (case-insensitive) in the accumulated parts.
     */
    private static void addPart(List<String> parts, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        String trimmed = value.trim();
        boolean duplicate = parts.stream()
                .anyMatch(p -> p.equalsIgnoreCase(trimmed));
        if (!duplicate) {
            parts.add(trimmed);
        }
    }
}
