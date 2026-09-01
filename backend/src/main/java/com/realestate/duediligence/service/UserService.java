package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.AuthResponse;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service class responsible for user registration and login.
 *
 * Handles business logic such as checking existing users, encrypting passwords,
 * validating login credentials, and generating JWT tokens.
 */
@Service
public class UserService {

	// Used to interact with the User table in the database.
	private final UserRepository userRepository;

	// Used to securely hash passwords and verify passwords during login.
	private final PasswordEncoder passwordEncoder;

	// Used to generate JWT tokens after successful registration or login.
	private final JwtUtil jwtUtil;

	/**
	 * Constructor injection for the required dependencies.
	 */
	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
	}

	/**
	 * Registers a new user.
	 *
	 * Flow: 1. Check whether the email is already registered. 2. Create a new User
	 * entity. 3. Hash the user's password. 4. Save the user to the database. 5.
	 * Generate a JWT token. 6. Return the user details and token.
	 */
	public AuthResponse register(RegisterRequest request) {

		// Prevent registration with an email that already exists.
		if (userRepository.findByEmail(request.getEmail()).isPresent()) {
			throw new IllegalArgumentException("Email is already registered");
		}

		// Create a new User entity using the registration details.
		User user = new User();
		user.setFullName(request.getFullName());
		user.setEmail(request.getEmail());

		// Hash the password before storing it in the database.
		// The original plain-text password is never stored.
		user.setPassword(passwordEncoder.encode(request.getPassword()));

		user.setRole(request.getRole());

		// Save the new user and get the saved entity with its generated ID.
		User savedUser = userRepository.save(user);

		// Generate a JWT token using the registered user's email.
		String token = jwtUtil.generateToken(savedUser.getEmail());

		// Return the token and user details to the controller/client.
		return new AuthResponse(token, savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(),
				savedUser.getRole());
	}

	/**
	 * Authenticates an existing user.
	 *
	 * Flow: 1. Find the user by email. 2. Verify the entered password against the
	 * stored hashed password. 3. Generate a JWT token. 4. Return the token and user
	 * details.
	 */
	public AuthResponse login(LoginRequest request) {

		// Find the user using the email provided during login.
		// If no user is found, return an authentication error.
		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

		// Compare the entered password with the hashed password stored in the database.
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		// Generate a JWT token after successful authentication.
		String token = jwtUtil.generateToken(user.getEmail());

		// Return the JWT token along with the user's details.
		return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole());
	}
}