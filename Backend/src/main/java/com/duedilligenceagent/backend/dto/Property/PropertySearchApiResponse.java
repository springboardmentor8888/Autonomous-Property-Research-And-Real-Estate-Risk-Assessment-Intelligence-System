package com.duedilligenceagent.backend.dto.Property;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * HTTP-level wrapper around {@link PropertySearchResponse}.
 * <p>
 * Returned for every call to {@code /api/properties/search} so the frontend
 * has a stable envelope with a top-level {@code message} string field that
 * can be shown as a toast / alert when the address is invalid.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PropertySearchApiResponse {

    /** HTTP-style success flag, mirrors typical frontend expectations. */
    private boolean success;

    /** Top-level human-readable message — used by the UI for error toasts. */
    private String message;

    /** The actual search result payload (null on hard failure). */
    private PropertySearchResponse data;
}
