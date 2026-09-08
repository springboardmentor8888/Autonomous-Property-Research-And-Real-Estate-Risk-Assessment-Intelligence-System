package com.realestate.backend.Exception;

public class OwnershipRecordNotFoundException extends RuntimeException {

    public OwnershipRecordNotFoundException(String message) {
        super(message);
    }
}