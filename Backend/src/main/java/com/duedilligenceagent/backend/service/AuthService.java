package com.duedilligenceagent.backend.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.duedilligenceagent.backend.dto.AuthResponse;
import com.duedilligenceagent.backend.dto.LoginRequest;
import com.duedilligenceagent.backend.dto.RegisterRequest;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.repositories.UserRepository;
import com.duedilligenceagent.backend.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setEmail(request.getEmail());

        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        user.setIsActive(true);

        user.setRoleId(1L);

        userRepository.save(user);

        return new AuthResponse(
                null,
                "User registered successfully"
        );
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        String roleName = user.getRole().getName();

        var springUser =
                org.springframework.security.core.userdetails.User
                        .withUsername(user.getEmail())
                        .password(user.getPasswordHash())
                        .roles(roleName)
                        .disabled(!user.getIsActive())
                        .build();

        String token = jwtService.generateToken(springUser);

        return new AuthResponse(
                token,
                "Login successful"
        );
    }
}
