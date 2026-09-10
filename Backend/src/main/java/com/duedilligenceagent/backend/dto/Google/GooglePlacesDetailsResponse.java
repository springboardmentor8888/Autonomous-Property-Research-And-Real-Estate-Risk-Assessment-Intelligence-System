package com.duedilligenceagent.backend.dto.Google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Minimal response of Places API (New) {@code GET /v1/places/{id}} with
 * the field mask {@code primaryType,types} — Google's own classification
 * of the place. Unknown fields are ignored.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GooglePlacesDetailsResponse {

    private String primaryType;
    private List<String> types;
}
