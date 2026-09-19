package com.realestate.duediligence.exception;

/**
 * Thrown when a simulated (or real) external data source fails even after
 * retrying. Represents "the external service is down," not "the user did
 * something wrong."
 */
public class ExternalServiceException extends RuntimeException {
	public ExternalServiceException(String message) {
		super(message);
	}
}