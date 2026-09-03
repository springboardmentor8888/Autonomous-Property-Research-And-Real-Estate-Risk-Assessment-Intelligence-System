package com.realestate.backend.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.LoginResponse;
import com.realestate.backend.Entity.User;
import com.realestate.backend.Exception.DuplicateEmailException;
import com.realestate.backend.Exception.InvalidCredentialsException;
import com.realestate.backend.Repository.UserRepository;
import com.realestate.backend.Security.JwtService;
import com.realestate.backend.dto.UpdateRoleRequest;
import com.realestate.backend.dto.UpdateUserRequest;
import com.realestate.backend.dto.UserResponse;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	public UserResponse registerUser(User user) {

		if (userRepository.existsByEmail(user.getEmail())) {
			throw new DuplicateEmailException("Email already registered");
		}

		user.setPassword(passwordEncoder.encode(user.getPassword()));

		User savedUser = userRepository.save(user);

		return new UserResponse(savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole());
	}

	public LoginResponse loginUser(String email, String password) {

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

		if (!passwordEncoder.matches(password, user.getPassword())) {
			throw new InvalidCredentialsException("Invalid email or password");
		}
		String token = jwtService.generateToken(
		        user.getEmail(),
		        user.getRole().name()
		);
		return new LoginResponse(
		        user.getId(),
		        user.getName(),
		        user.getEmail(),
		        user.getRole().name(),
		        "Login successful",
		        token
		);
	}

	public UserResponse getUserProfile(Long id) {

		User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

		return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
	}

	public UserResponse updateUserProfile(Long id, UpdateUserRequest request) {

		User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

		if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
			throw new DuplicateEmailException("Email already registered");
		}

		user.setName(request.getName());
		user.setEmail(request.getEmail());

		User updatedUser = userRepository.save(user);

		return new UserResponse(updatedUser.getId(), updatedUser.getName(), updatedUser.getEmail(),
				updatedUser.getRole());
	}

	public UserResponse updateUserRole(Long id, UpdateRoleRequest request) {

		User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

		user.setRole(request.getRole());

		User updatedUser = userRepository.save(user);

		return new UserResponse(updatedUser.getId(), updatedUser.getName(), updatedUser.getEmail(),
				updatedUser.getRole());
	}
}