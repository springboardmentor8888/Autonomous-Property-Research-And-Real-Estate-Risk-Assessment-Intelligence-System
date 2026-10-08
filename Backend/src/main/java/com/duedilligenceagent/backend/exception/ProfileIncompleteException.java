package com.duedilligenceagent.backend.exception;

/**
 * Thrown when an action requires a completed profile (first name, last
 * name and phone) but the authenticated user's profile is still
 * incomplete — e.g. searching for a property before finishing the
 * profile. Mapped to HTTP 403 with the missing fields named.
 */
public class ProfileIncompleteException extends RuntimeException {

    private final String missingFields;

    public ProfileIncompleteException(String missingFields) {
        super("Complete your profile before searching properties — missing: " + missingFields + ".");
        this.missingFields = missingFields;
    }

    /** Comma-separated list of the missing profile fields. */
    public String getMissingFields() {
        return missingFields;
    }
}
