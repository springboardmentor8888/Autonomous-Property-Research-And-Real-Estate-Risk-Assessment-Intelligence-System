package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.*;
import com.realestate.duediligence.entity.Role;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.entity.AuditLog;
import com.realestate.duediligence.repository.AuditLogRepository;
import com.realestate.duediligence.repository.RoleRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       AuditLogRepository auditLogRepository, PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email address is already in use");
        }

        String roleStr = request.getRole() != null ? request.getRole().toUpperCase() : "BUYER";
        if (roleStr.equals("ADMIN")) {
            roleStr = "ADMINISTRATOR";
        }
        final String targetRoleStr = roleStr;

        Role role = roleRepository.findByRoleName(targetRoleStr)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(targetRoleStr).build()));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        // Audit log
        auditLogRepository.save(AuditLog.builder()
                .userId(user.getId())
                .action("USER_REGISTERED: " + user.getEmail())
                .timestamp(LocalDateTime.now())
                .build());

        String token = jwtUtils.generateToken(user.getEmail(), role.getRoleName());
        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(role.getRoleName())
                .build();

        return AuthResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().getRoleName());

        // Audit log
        auditLogRepository.save(AuditLog.builder()
                .userId(user.getId())
                .action("USER_LOGGED_IN: " + user.getEmail())
                .timestamp(LocalDateTime.now())
                .build());

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getRoleName())
                .build();

        return AuthResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }

    public UserDto getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().getRoleName() : "BUYER")
                .build();
    }
}
