package com.realestate.backend.Exception;

public class ApiLogNotFoundException extends RuntimeException {

    public ApiLogNotFoundException(String message) {
        super(message);
    }
}