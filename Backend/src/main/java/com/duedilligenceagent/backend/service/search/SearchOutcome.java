package com.duedilligenceagent.backend.service.search;

import com.duedilligenceagent.backend.dto.Property.PropertySearchApiResponse;
import com.duedilligenceagent.backend.entities.Property;

/**
 * Result of one search path: the stored property the search resolved to
 * (null when the address could not be resolved at all) plus the response
 * to return to the caller.
 */
record SearchOutcome(Property property, PropertySearchApiResponse response) {

    /** A search that resolved to no stored property (invalid address, API error). */
    static SearchOutcome failure(PropertySearchApiResponse response) {
        return new SearchOutcome(null, response);
    }
}
