package com.realestate.duediligence.dto;

import lombok.Data; // Generates getters, setters, toString, equals and hashCode.

/**
 * DTO used to receive login information sent by the client.
 *
 * This class represents the data required when a user attempts to log in to the
 * application.
 *
 * It is used for transferring data from the client to the backend.
 *
 * This is not a database entity. It is only used to carry login request data
 * between application layers.
 */
@Data
public class LoginRequest {

	/*
	 * Email address entered by the user during login.
	 */
	private String email;

	/*
	 * Password entered by the user during login.
	 *
	 * The password is received by the backend so that it can be verified against
	 * the user's stored credentials.
	 */
	private String password;
}
