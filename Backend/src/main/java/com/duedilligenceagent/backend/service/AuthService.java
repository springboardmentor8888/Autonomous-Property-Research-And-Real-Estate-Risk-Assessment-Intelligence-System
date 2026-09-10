package com.duedilligenceagent.backend.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.duedilligenceagent.backend.dto.AuthResponse;
import com.duedilligenceagent.backend.dto.LoginRequest;
import com.duedilligenceagent.backend.dto.RegisterRequest;
import com.duedilligenceagent.backend.entities.RefreshToken;
import com.duedilligenceagent.backend.entities.Role;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.entities.enums.RoleName;
import com.duedilligenceagent.backend.repositories.RoleRepository;
import com.duedilligenceagent.backend.repositories.UserRepository;
import com.duedilligenceagent.backend.security.JwtService;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    // Roles allowed for self-registration (excluding ADMINISTRATOR)
    private static final Set<RoleName> ALLOWED_REGISTRATION_ROLES = Set.of(
            RoleName.BUYER,
            RoleName.REAL_ESTATE_AGENT,
            RoleName.LEGAL_REVIEWER,
            RoleName.FINANCIAL_INSTITUTION
    );

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            RefreshTokenService refreshTokenService) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new com.duedilligenceagent.backend.exception.UserAlreadyExistsException("Email already registered");
        }

        // Validate role - ADMINISTRATOR not allowed for self-registration
        RoleName requestedRole = request.getRole();
        if (requestedRole == null || !ALLOWED_REGISTRATION_ROLES.contains(requestedRole)) {
            throw new com.duedilligenceagent.backend.exception.InvalidAuthRequestException(
                    "Invalid role selected. Administrator role cannot be self-registered.");
        }

        Role role = roleRepository.findByName(requestedRole.name())
                .orElseThrow(() -> new com.duedilligenceagent.backend.exception.InvalidAuthRequestException(
                        "Role not found: " + requestedRole.name()));

        User user = new User();

        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);
        user.setRoleId(role.getId());

        userRepository.save(user);

        String roleName = role.getName();

        // Use the role we already fetched - no need to re-query
        String accessToken = jwtService.generateAccessToken(
                org.springframework.security.core.userdetails.User
                        .withUsername(user.getEmail())
                        .password(user.getPasswordHash())
                        .roles(roleName)
                        .disabled(!user.getIsActive())
                        .build()
        );

        // Create and store refresh token - pass roleName explicitly to avoid lazy loading
        RefreshToken refreshToken = refreshTokenService.createRefreshTokenForRegistration(user, roleName);
        refreshTokenService.setRefreshTokenCookie(response, refreshToken.getToken());

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                user.getEmail(),
                roleName,
                "User registered successfully"
        );
    }

    /**
     * Login is @Transactional so the lazy {@code Role} association can
     * be initialised while the Hibernate session is still open. Without
     * this, {@code user.getRole().getName()} throws
     * {@code LazyInitializationException}.
     */
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {

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

        String accessToken = jwtService.generateAccessToken(springUser);

        // Create and store refresh token (rotates existing tokens) - pass roleName explicitly
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, roleName);
        refreshTokenService.setRefreshTokenCookie(response, refreshToken.getToken());

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                user.getEmail(),
                roleName,
                "Login successful"
        );
    }

    @Transactional
    public void logout(HttpServletResponse response) {
        refreshTokenService.clearRefreshTokenCookie(response);
        refreshTokenService.clearAccessTokenCookie(response);
    }
}
