package com.realestate.duediligence.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {

		Map<String, Object> error = new HashMap<>();
		error.put("code", "VALIDATION_ERROR");
		error.put("message", ex.getMessage());

		Map<String, Object> body = new HashMap<>();
		body.put("success", false);
		body.put("error", error);

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}

	/**
	 * Handles the case where an authenticated user tries to access a
	 * resource restricted to a different role (e.g. @PreAuthorize check
	 * fails). Without this specific handler, this exception would fall
	 * through to the generic handler below and incorrectly return 500
	 * instead of 403.
	 */
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {

		Map<String, Object> error = new HashMap<>();
		error.put("code", "FORBIDDEN");
		error.put("message", "You do not have permission to access this resource.");

		Map<String, Object> body = new HashMap<>();
		body.put("success", false);
		body.put("error", error);

		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {

		Map<String, Object> error = new HashMap<>();
		error.put("code", "INTERNAL_ERROR");
		error.put("message", "Something went wrong. Please try again.");

		Map<String, Object> body = new HashMap<>();
		body.put("success", false);
		body.put("error", error);

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
	}
}