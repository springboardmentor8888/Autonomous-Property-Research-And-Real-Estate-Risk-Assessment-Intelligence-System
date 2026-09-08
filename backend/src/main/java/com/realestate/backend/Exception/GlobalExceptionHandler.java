package com.realestate.backend.Exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<String> handleDuplicateEmail(
            DuplicateEmailException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ex.getMessage());
    }
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<String> handleInvalidCredentials(
            InvalidCredentialsException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ex.getMessage());
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity.badRequest().body(errors);
    }
    @ExceptionHandler(PropertyNotFoundException.class)
    public ResponseEntity<String> handlePropertyNotFound(
            PropertyNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }
    @ExceptionHandler(DueDiligenceAlreadyExistsException.class)
    public ResponseEntity<String> handleDueDiligenceAlreadyExists(
            DueDiligenceAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ex.getMessage());
    }
    @ExceptionHandler(DueDiligenceNotFoundException.class)
    public ResponseEntity<String> handleDueDiligenceNotFound(
            DueDiligenceNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }
    @ExceptionHandler(OwnershipRecordNotFoundException.class)
    public ResponseEntity<String> handleOwnershipRecordNotFound(
            OwnershipRecordNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }
    @ExceptionHandler(BuildingPermitRecordNotFoundException.class)
    public ResponseEntity<String> handleBuildingPermitRecordNotFound(
            BuildingPermitRecordNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }
    @ExceptionHandler(ZoningInformationNotFoundException.class)
    public ResponseEntity<String> handleZoningInformationNotFound(
            ZoningInformationNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }
    @ExceptionHandler(FloodZoneVerificationNotFoundException.class)
    public ResponseEntity<String> handleFloodZoneVerificationNotFound(
            FloodZoneVerificationNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }
    @ExceptionHandler(EnvironmentalRecordNotFoundException.class)
    public ResponseEntity<String> handleEnvironmentalRecordNotFound(
            EnvironmentalRecordNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }
    @ExceptionHandler(UtilityInformationNotFoundException.class)
    public ResponseEntity<String> handleUtilityInformationNotFound(
            UtilityInformationNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }
    @ExceptionHandler(PropertyHistoryNotFoundException.class)
    public ResponseEntity<String> handlePropertyHistoryNotFound(
            PropertyHistoryNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }
}
