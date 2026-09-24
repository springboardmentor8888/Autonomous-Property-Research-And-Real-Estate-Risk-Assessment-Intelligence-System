package com.duedilligenceagent.backend.exception;

/**
 * Thrown when a referenced resource (property, run, ...) does not exist.
 * Mapped to HTTP 404 by {@link GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
