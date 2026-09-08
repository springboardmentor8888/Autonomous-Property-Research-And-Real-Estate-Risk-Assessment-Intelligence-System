package com.realestate.backend.Exception;

public class PropertyHistoryNotFoundException extends RuntimeException {

    public PropertyHistoryNotFoundException(String message) {
        super(message);
    }
}