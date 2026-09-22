package com.realestate.duediligence.exception;

import org.springframework.http.HttpStatus; 
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/*
 * @RestControllerAdvice makes this class a global exception handler
 * for all REST controllers in the application.
 *
 * Instead of handling exceptions separately inside every controller,
 * exceptions can be handled centrally in this class.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	/*
	 * Handles IllegalArgumentException.
	 *
	 * Example: PropertyService throws: throw new
	 * IllegalArgumentException("Property not found");
	 *
	 * This method converts that exception into a proper HTTP 400 response.
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {

		// Create the error details that will be returned to the client.
		Map<String, Object> error = new HashMap<>();

		error.put("code", "VALIDATION_ERROR");

		// Get the actual exception message.
		error.put("message", ex.getMessage());

		/*
		 * Create the main response body.
		 *
		 * The project follows a common response structure:
		 *
		 * { "success": false, "error": { "code": "...", "message": "..." } }
		 */
		Map<String, Object> body = new HashMap<>();

		body.put("success", false);
		body.put("error", error);

		// HTTP 400 = Bad Request
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}

	/*
	 * Handles AccessDeniedException.
	 *
	 * This occurs when the authenticated user does not have sufficient
	 * permission/role to access a protected resource.
	 *
	 * Example: A BUYER tries to access an endpoint allowed only for ADMINISTRATOR.
	 */
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {

		Map<String, Object> error = new HashMap<>();

		error.put("code", "FORBIDDEN");
		error.put("message", "You do not have permission to access this resource.");

		Map<String, Object> body = new HashMap<>();

		body.put("success", false);
		body.put("error", error);

		// HTTP 403 = Forbidden
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
	}

	/*
	 * Handles failures while communicating with external services.
	 *
	 * In our project, this can happen when the application fails to retrieve data
	 * from an external source after retry attempts.
	 *
	 * Example: Geoapify / simulated registry / tax authority etc.
	 */
	@ExceptionHandler(ExternalServiceException.class)
	public ResponseEntity<Map<String, Object>> handleExternalServiceException(ExternalServiceException ex) {

		Map<String, Object> error = new HashMap<>();

		error.put("code", "EXTERNAL_SERVICE_ERROR");
		error.put("message", ex.getMessage());

		Map<String, Object> body = new HashMap<>();

		body.put("success", false);
		body.put("error", error);

		/*
		 * HTTP 503 = Service Unavailable
		 *
		 * This tells the client that the problem is related to a required external
		 * service being unavailable.
		 */
		return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
	}

	/*
	 * Catch-all handler.
	 *
	 * If an exception occurs that is NOT handled by any of the specific handlers
	 * above, this method handles it.
	 *
	 * This prevents the API from returning an uncontrolled exception response to
	 * the client.
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {

		Map<String, Object> error = new HashMap<>();

		error.put("code", "INTERNAL_ERROR");

		/*
		 * Do not expose internal exception details to the client.
		 *
		 * For example, database errors or internal implementation details should not
		 * normally be sent directly to users.
		 */
		error.put("message", "Something went wrong. Please try again.");

		Map<String, Object> body = new HashMap<>();

		body.put("success", false);
		body.put("error", error);

		// HTTP 500 = Internal Server Error
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
	}
}