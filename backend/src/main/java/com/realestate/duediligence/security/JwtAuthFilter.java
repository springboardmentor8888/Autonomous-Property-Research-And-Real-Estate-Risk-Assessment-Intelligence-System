package com.realestate.duediligence.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT authentication filter.
 *
 * This filter runs once for each HTTP request and checks whether the request
 * contains a valid JWT token in the Authorization header.
 *
 * If the token is valid, the user's email is extracted and the user is added to
 * Spring Security's SecurityContext.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

	// Utility class used to validate JWT tokens and extract user information.
	private final JwtUtil jwtUtil;

	/**
	 * Constructor injection is used to provide JwtUtil to this filter.
	 */
	public JwtAuthFilter(JwtUtil jwtUtil) {
		this.jwtUtil = jwtUtil;
	}

	/**
	 * Intercepts every HTTP request and checks for JWT authentication.
	 */
	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {

		// Get the Authorization header from the incoming request.
		String authHeader = request.getHeader("Authorization");

		// Check whether the Authorization header exists
		// and follows the "Bearer <token>" format.
		if (authHeader != null && authHeader.startsWith("Bearer ")) {

			// Remove "Bearer " from the header and get only the JWT token.
			String token = authHeader.substring(7);

			// Check whether the JWT is valid and has not expired.
			if (jwtUtil.isTokenValid(token)) {

				// Extract the user's email stored in the JWT subject.
				String email = jwtUtil.extractEmail(token);

				/*
				 * Create an Authentication object representing the authenticated user.
				 *
				 * email → identifies the user null → no password is needed because JWT already
				 * authenticated the user emptyList() → no roles/authorities are assigned here
				 */
				UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, null,
						Collections.emptyList());

				// Store the authenticated user in Spring Security's SecurityContext.
				// Spring Security can now recognize this request as authenticated.
				SecurityContextHolder.getContext().setAuthentication(authToken);
			}
		}

		// Continue the request to the next filter or eventually to the controller.
		filterChain.doFilter(request, response);
	}
}
