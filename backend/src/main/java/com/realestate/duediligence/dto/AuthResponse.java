package com.realestate.duediligence.dto;

import com.realestate.duediligence.entity.Role; // Role of the authenticated user.

import lombok.AllArgsConstructor; // Generates a constructor with all fields.
import lombok.Data; // Generates getters, setters, toString, equals and hashCode.

/**
 * DTO (Data Transfer Object) used to send authentication-related information
 * from the backend to the client after successful authentication.
 *
 * This class is part of the DTO layer, not the database/entity layer.
 *
 * It contains only the information that the client needs after authentication,
 * instead of directly returning the User entity.
 */
@Data
@AllArgsConstructor
public class AuthResponse {

	/*
	 * Authentication token generated after successful login.
	 *
	 * The client can use this token in later requests to prove that the user has
	 * been authenticated.
	 */
	private String token;

	/*
	 * Unique ID of the authenticated user.
	 */
	private Long id;

	/*
	 * Full name of the authenticated user.
	 */
	private String fullName;

	/*
	 * Email address of the authenticated user.
	 */
	private String email;

	/*
	 * Role of the authenticated user.
	 *
	 * This can be used by the application to determine what functionality the user
	 * is allowed to access.
	 */
	private Role role;
}
