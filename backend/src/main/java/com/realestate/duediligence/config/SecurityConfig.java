package com.realestate.duediligence.config;

import com.realestate.duediligence.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuration class for Spring Security.
 *
 * Defines password encryption, JWT authentication, session management, and
 * which API endpoints require authentication.
 */
@Configuration
public class SecurityConfig {

	// JWT filter that checks the JWT token in incoming requests.
	private final JwtAuthFilter jwtAuthFilter;

	/**
	 * Constructor injection for JwtAuthFilter.
	 */
	public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
		this.jwtAuthFilter = jwtAuthFilter;
	}

	/**
	 * Provides BCrypt password encoder for securely hashing passwords.
	 *
	 * Passwords should never be stored as plain text in the database.
	 */
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	/**
	 * Configures Spring Security for the application.
	 */
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http
				// Disable CSRF because this application uses stateless JWT authentication.
				.csrf(AbstractHttpConfigurer::disable)

				// Do not create or maintain HTTP sessions.
				// Each request must provide its own JWT token for authentication.
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				// Define which endpoints are publicly accessible
				// and which endpoints require authentication.
				.authorizeHttpRequests(auth -> auth

						// Login, registration, and health-check endpoints
						// can be accessed without a JWT token.
						.requestMatchers("/api/auth/**", "/api/health").permitAll()

						// All other API endpoints require authentication.
						.anyRequest().authenticated())

				// Run the custom JWT filter before Spring Security's
				// UsernamePasswordAuthenticationFilter.
				.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

		// Build and return the configured security filter chain.
		return http.build();
	}
}