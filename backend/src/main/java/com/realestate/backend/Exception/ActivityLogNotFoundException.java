package com.realestate.backend.Exception;

public class ActivityLogNotFoundException extends RuntimeException {

    public ActivityLogNotFoundException(String message) {
        super(message);
    }
}