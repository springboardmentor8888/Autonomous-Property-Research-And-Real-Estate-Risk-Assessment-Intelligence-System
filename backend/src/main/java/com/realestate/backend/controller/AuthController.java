package com.realestate.backend.controller;

import com.realestate.backend.dto.LoginRequest;
import com.realestate.backend.dto.LoginResponse;
import com.realestate.backend.dto.RegisterRequest;
import com.realestate.backend.dto.UserResponse;
import com.realestate.backend.entity.User;
import com.realestate.backend.security.JwtService;
import com.realestate.backend.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

private final UserService userService;
private final AuthenticationManager authenticationManager;
private final JwtService jwtService;

public AuthController(
        UserService userService,
        AuthenticationManager authenticationManager,
        JwtService jwtService) {

    this.userService = userService;
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
}

@PostMapping("/register")
public ResponseEntity<UserResponse> register(
        @RequestBody RegisterRequest request) {

    User user = userService.registerUser(request);

    UserResponse response = new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail()
    );

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
}

@PostMapping("/login")
public ResponseEntity<LoginResponse> login(
        @RequestBody LoginRequest request) {

    Authentication authentication =
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

    String role = authentication.getAuthorities()
            .stream()
            .findFirst()
            .map(GrantedAuthority::getAuthority)
            .orElse("ROLE_USER")
            .replace("ROLE_", "");

    String token = jwtService.generateToken(
            request.getEmail(),
            role
    );

    return ResponseEntity.ok(
            new LoginResponse(token)
    );
}

@GetMapping("/test")
public ResponseEntity<String> testProtectedEndpoint() {
    return ResponseEntity.ok("JWT authentication successful!");
}

}