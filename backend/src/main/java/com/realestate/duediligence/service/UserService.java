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

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;
	private final AuditService auditService;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
			AuditService auditService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
		this.auditService = auditService;
	}

	public AuthResponse register(RegisterRequest request) {

		if (userRepository.findByEmail(request.getEmail()).isPresent()) {
			throw new IllegalArgumentException("Email is already registered");
		}

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

		auditService.log(savedUser.getEmail(), "REGISTER", "New account created with role " + savedUser.getRole());

		return new AuthResponse(token, savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(),
				savedUser.getRole());
	}

	public AuthResponse login(LoginRequest request) {

		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

		auditService.log(user.getEmail(), "LOGIN", null);

		return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole());
	}
}