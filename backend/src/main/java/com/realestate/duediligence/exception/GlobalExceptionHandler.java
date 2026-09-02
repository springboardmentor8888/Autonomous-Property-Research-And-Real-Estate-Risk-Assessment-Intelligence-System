package com.realestate.duediligence.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * GlobalExceptionHandler handles exceptions thrown by controllers throughout
 * the application.
 *
 * Instead of writing try-catch blocks in every controller, we can handle common
 * exceptions in one central class.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	/*
	 * Handles IllegalArgumentException thrown anywhere in the controller/service
	 * flow.
	 *
	 * This is generally used for invalid input or validation-related problems.
	 *
	 * Example: If a user already exists or some input is invalid, the service layer
	 * may throw IllegalArgumentException.
	 *
	 * The client receives HTTP 400 BAD REQUEST.
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {

		// Create a map to store details about the error.
		Map<String, Object> error = new HashMap<>();

		// Add a predefined error code so the frontend can identify the error type.
		error.put("code", "VALIDATION_ERROR");

		// Add the actual exception message.
		error.put("message", ex.getMessage());

		// Create the main response body.
		Map<String, Object> body = new HashMap<>();

		// Indicates that the request was not successful.
		body.put("success", false);

		// Add the error details to the response.
		body.put("error", error);

		// Return the error response with HTTP 400 BAD REQUEST status.
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}

	/*
	 * Handles any unexpected exception that is not handled by a more
	 * specific @ExceptionHandler.
	 *
	 * This acts as a fallback for unexpected server-side errors.
	 *
	 * The actual exception message is not returned to the client to avoid exposing
	 * internal application details.
	 *
	 * The client receives HTTP 500 INTERNAL SERVER ERROR.
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {

		// Create a map to store the error details.
		Map<String, Object> error = new HashMap<>();

		// Add a general error code for unexpected server errors.
		error.put("code", "INTERNAL_ERROR");

		// Return a safe, user-friendly message instead of exposing
		// the internal exception details.
		error.put("message", "Something went wrong. Please try again.");

		// Create the main response body.
		Map<String, Object> body = new HashMap<>();

		// Indicates that the request was not successful.
		body.put("success", false);

		// Add the error details to the response.
		body.put("error", error);

		// Return the error response with HTTP 500 INTERNAL SERVER ERROR status.
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
	}
}
