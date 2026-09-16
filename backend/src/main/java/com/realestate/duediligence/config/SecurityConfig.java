package com.realestate.duediligence.config;

import com.realestate.duediligence.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuration class for Spring Security.
 *
 * This class is responsible for configuring the application's security rules.
 *
 * Main responsibilities:
 * 1. Password encryption using BCrypt.
 * 2. CORS configuration for frontend applications.
 * 3. JWT authentication using JwtAuthFilter.
 * 4. Stateless session management.
 * 5. Public and protected API endpoints.
 * 6. Handling unauthorized requests.
 * 7. Enabling method-level security such as @PreAuthorize.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

	/*
	 * JwtAuthFilter is responsible for reading the JWT token from the
	 * Authorization header, validating it, and setting the authenticated
	 * user in Spring Security's SecurityContext.
	 *
	 * It is injected through the constructor so that Spring can provide
	 * the configured JwtAuthFilter object.
	 */
	private final JwtAuthFilter jwtAuthFilter;

	public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
		this.jwtAuthFilter = jwtAuthFilter;
	}

	/**
	 * Creates the PasswordEncoder used by the application.
	 *
	 * BCrypt is a one-way password hashing algorithm.
	 * We should never store plain-text passwords in the database.
	 *
	 * During registration:
	 * Plain password -> BCrypt hash -> Database
	 *
	 * During login:
	 * Entered password -> compared with stored BCrypt hash
	 */
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	/**
	 * Configures Cross-Origin Resource Sharing (CORS).
	 *
	 * CORS controls which frontend applications are allowed to
	 * communicate with this backend from a different origin.
	 *
	 * Here, the backend allows requests from:
	 * - React development server running on port 3000
	 * - React/Vite development server running on port 5173
	 *
	 * The configuration also allows common HTTP methods and headers.
	 */
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();

		// Allow requests from the frontend development servers.
		configuration.setAllowedOrigins(
				List.of("http://localhost:3000", "http://localhost:5173"));

		// Allow the HTTP methods used by the REST API.
		configuration.setAllowedMethods(
				List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

		// Allow all request headers, including the Authorization header
		// that contains the JWT token.
		configuration.setAllowedHeaders(List.of("*"));

		// Allow credentials such as cookies or authorization-related
		// credentials to be included in cross-origin requests.
		configuration.setAllowCredentials(true);

		/*
		 * UrlBasedCorsConfigurationSource applies the CORS configuration
		 * to specific URL patterns.
		 *
		 * "/**" means the configuration applies to all API endpoints.
		 */
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);

		return source;
	}

	/**
	 * Handles requests where authentication is required but the user
	 * has not been successfully authenticated.
	 *
	 * Example:
	 * A protected endpoint is requested without a valid JWT token.
	 *
	 * Instead of returning a default HTML error response, the application
	 * returns a JSON response suitable for a REST API.
	 */
	@Bean
	public AuthenticationEntryPoint authenticationEntryPoint() {
		return (request, response, authException) -> {

			// HTTP 401 means the client is not authenticated.
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

			// Tell the client that the response contains JSON.
			response.setContentType("application/json");

			// Return a consistent JSON error response.
			response.getWriter().write(
					"{\"success\":false,\"error\":{\"code\":\"UNAUTHORIZED\",\"message\":\"Authentication required\"}}");
		};
	}

	/**
	 * Defines the main Spring Security filter chain.
	 *
	 * The filter chain determines how every incoming HTTP request
	 * is processed and whether the request is allowed to continue.
	 */
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http
				/*
				 * Enable CORS using our custom CORS configuration.
				 */
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))

				/*
				 * Disable CSRF because this application uses stateless JWT
				 * authentication instead of traditional session-based
				 * authentication.
				 */
				.csrf(AbstractHttpConfigurer::disable)

				/*
				 * Configure the application as STATELESS.
				 *
				 * Spring Security will not create or maintain an HTTP session
				 * for storing authentication information.
				 *
				 * Each request must provide its JWT token.
				 */
				.sessionManagement(session -> session
						.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				/*
				 * Configure what happens when authentication is required
				 * but the user is not authenticated.
				 */
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint(authenticationEntryPoint()))

				/*
				 * Define which endpoints are publicly accessible.
				 *
				 * /api/auth/** -> Registration and login endpoints
				 * /api/health  -> Health-check endpoint
				 *
				 * All other endpoints require authentication.
				 */
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/api/auth/**", "/api/health").permitAll()
						.anyRequest().authenticated())

				/*
				 * Add our JWT filter before Spring Security's standard
				 * UsernamePasswordAuthenticationFilter.
				 *
				 * Request flow:
				 *
				 * Client
				 *   |
				 *   | Authorization: Bearer <JWT>
				 *   v
				 * JwtAuthFilter
				 *   |
				 *   | Validate JWT
				 *   v
				 * SecurityContext
				 *   |
				 *   v
				 * Controller
				 *
				 * Placing the JWT filter before the standard authentication
				 * filter ensures that the JWT is processed before Spring
				 * Security checks whether the request is authenticated.
				 */
				.addFilterBefore(
						jwtAuthFilter,
						UsernamePasswordAuthenticationFilter.class);

		// Build and return the configured Spring Security filter chain.
		return http.build();
	}
}