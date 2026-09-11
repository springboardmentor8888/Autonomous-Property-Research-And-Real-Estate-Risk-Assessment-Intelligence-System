package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.AuthResponse;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.entity.Role;
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

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

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
	 * Generate a JWT token (embedding the user's role). 6. Return the user details
	 * and token.
	 */
	public AuthResponse register(RegisterRequest request) {

		if (userRepository.findByEmail(request.getEmail()).isPresent()) {
			throw new IllegalArgumentException("Email is already registered");
		}
		
		// Prevent public self-registration as ADMINISTRATOR.
		// Admin accounts must be created separately, never through open
		// registration, to avoid unrestricted privilege escalation.
		if (request.getRole() == Role.ADMINISTRATOR) {
		    throw new IllegalArgumentException("Administrator accounts cannot be self-registered.");
		}

		User user = new User();
		user.setFullName(request.getFullName());
		user.setEmail(request.getEmail());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		user.setRole(request.getRole());

		User savedUser = userRepository.save(user);

		String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name());

		return new AuthResponse(token, savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(),
				savedUser.getRole());
	}

	/**
	 * Authenticates an existing user.
	 *
	 * Flow: 1. Find the user by email. 2. Verify the entered password against the
	 * stored hashed password. 3. Generate a JWT token (embedding the user's role).
	 * 4. Return the token and user details.
	 */
	public AuthResponse login(LoginRequest request) {

		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

		return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole());
	}
}