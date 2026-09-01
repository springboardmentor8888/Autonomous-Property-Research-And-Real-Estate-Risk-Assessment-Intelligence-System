package com.realestate.duediligence.dto;

import com.realestate.duediligence.entity.Role; // Role selected for the user during registration.

import lombok.Data; // Generates getters, setters, toString, equals and hashCode.

/**
 * DTO used to receive the information required to register a new user in the
 * application.
 *
 * This class is used to transfer registration data from the client to the
 * backend.
 *
 * It is not a database entity. The received data will eventually be converted
 * into a User entity before being saved in the database.
 */
@Data
public class RegisterRequest {

	/*
	 * Full name entered by the user during registration.
	 *
	 * This will later be mapped to the "name" field of the User entity.
	 */
	private String fullName;

	/*
	 * Email address provided during registration.
	 *
	 * The backend can use this to identify the user and should ensure that the
	 * email is not already registered.
	 */
	private String email;

	/*
	 * Password provided during registration.
	 *
	 * Before storing it in the database, the password should be securely hashed
	 * rather than stored as plain text.
	 */
	private String password;

	/*
	 * Role selected for the new user.
	 *
	 * The Role enum restricts this value to one of the predefined roles supported
	 * by the application.
	 */
	private Role role;
}
