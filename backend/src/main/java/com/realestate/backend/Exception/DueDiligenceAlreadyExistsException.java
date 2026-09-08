package com.realestate.backend.Exception;

public class DueDiligenceAlreadyExistsException extends RuntimeException {

    public DueDiligenceAlreadyExistsException(String message) {
        super(message);
    }
}