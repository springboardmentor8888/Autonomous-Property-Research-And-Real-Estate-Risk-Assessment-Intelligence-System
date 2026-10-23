package com.realestate.duediligence.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
		return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", ex.getMessage());
	}

	/**
	 * Fires when a @Valid request body fails its annotations. Without this handler
	 * it would fall into the generic handler and return 500.
	 */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleBeanValidation(MethodArgumentNotValidException ex) {
		String message = ex.getBindingResult().getFieldErrors().stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage()).collect(Collectors.joining("; "));
		return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
	}

	/**
	 * Fires for malformed JSON or a value that can't be converted, such as a role
	 * that isn't in the Role enum.
	 */
	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<Map<String, Object>> handleUnreadableBody(HttpMessageNotReadableException ex) {
		return build(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST",
				"Request body is missing, malformed, or contains an invalid value.");
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
		return build(HttpStatus.FORBIDDEN, "FORBIDDEN", "You do not have permission to access this resource.");
	}

	@ExceptionHandler(ExternalServiceException.class)
	public ResponseEntity<Map<String, Object>> handleExternalServiceException(ExternalServiceException ex) {
		return build(HttpStatus.SERVICE_UNAVAILABLE, "EXTERNAL_SERVICE_ERROR", ex.getMessage());
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
		return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Something went wrong. Please try again.");
	}

	/**
	 * Builds the standard error envelope from our API contract: { "success": false,
	 * "error": { "code": "...", "message": "..." } }
	 */
	private ResponseEntity<Map<String, Object>> build(HttpStatus status, String code, String message) {
		Map<String, Object> error = new HashMap<>();
		error.put("code", code);
		error.put("message", message);

		Map<String, Object> body = new HashMap<>();
		body.put("success", false);
		body.put("error", error);

		return ResponseEntity.status(status).body(body);
	}
}