package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.AuthResponse;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController handles authentication-related HTTP requests.
 *
 * Main responsibilities: 1. Receive registration and login requests from the
 * frontend. 2. Accept request data through DTOs. 3. Pass the request to
 * UserService for business logic. 4. Return the appropriate HTTP response to
 * the client.
 *
 * The controller should mainly handle HTTP communication. Business logic is
 * kept inside the service layer.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	/*
	 * UserService contains the business logic related to users, such as
	 * registration and login.
	 *
	 * final ensures that the service reference cannot be changed after the
	 * controller is created.
	 */
	private final UserService userService;

	/*
	 * Constructor injection is used to provide UserService to this controller.
	 *
	 * Spring automatically creates and injects the UserService object.
	 */
	public AuthController(UserService userService) {
		this.userService = userService;
	}

	/*
	 * Handles HTTP POST requests sent to: /api/auth/register
	 *
	 * @RequestBody converts the JSON request received from the frontend into a
	 * RegisterRequest Java object.
	 *
	 * The actual registration logic is handled by UserService.
	 *
	 * HTTP 201 CREATED is returned when registration is successful.
	 */
	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {

		// Send the registration data to the service layer.
		AuthResponse response = userService.register(request);

		// Return the authentication response with HTTP 201 CREATED status.
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	/*
	 * Handles HTTP POST requests sent to: /api/auth/login
	 *
	 * @RequestBody converts the JSON login request into a LoginRequest Java object.
	 *
	 * The actual login and authentication logic is handled by UserService.
	 */
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {

		// Send the login data to the service layer.
		AuthResponse response = userService.login(request);

		// Return the authentication response with HTTP 200 OK status.
		return ResponseEntity.ok(response);
	}
}
