package com.duedilligenceagent.backend.integration.apify;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * External request model for the Apify 99acres actor run.
 * <p>
 * Provider-specific input schema (Apify actor input) — never exposed to the
 * internal domain. Built by {@link com.duedilligenceagent.backend.integration.apify.ApifyClient}
 * from the Google-resolved address.
 * <p>
 * Common 99acres actor input fields: {@code city} + {@code searchMode} build
 * the search, {@code localities} narrows to neighborhoods, {@code maxResults}
 * caps the dataset.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApifyActorInput {

    /** Indian city to search (e.g. "Mumbai"). */
    private String city;

    /** 99acres section: rent, buy, pg or commercial. */
    private String searchMode;

    /** Neighborhood filter — empty / null searches the whole city. */
    private List<String> localities;

    /** Maximum listings to return. */
    private Integer maxResults;
}
