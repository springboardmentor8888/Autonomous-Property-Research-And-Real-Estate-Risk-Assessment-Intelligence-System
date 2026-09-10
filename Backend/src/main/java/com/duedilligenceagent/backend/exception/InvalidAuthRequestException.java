package com.duedilligenceagent.backend.exception;

/** Thrown for invalid business input during auth (e.g. disallowed role). */
public class InvalidAuthRequestException extends RuntimeException {
    public InvalidAuthRequestException(String message) {
        super(message);
    }
}
