package com.realestate.duediligence.config;

import com.realestate.duediligence.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
 * Defines password encryption, JWT authentication, session management, CORS
 * rules, and which API endpoints require authentication.
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
	 * Defines which frontend origins are allowed to call this API.
	 *
	 * Without this, browsers block requests from the frontend (running on a
	 * different port, e.g. localhost:3000) even if the backend itself is
	 * working correctly — this is a browser security rule, not a bug.
	 */
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();

		// Add every frontend URL that needs to call this API.
		// Update this list if your frontend teammates use a different port.
		configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));

		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));

		// Allows the frontend to send the Authorization header (JWT token).
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	/**
	 * Defines what response is sent when an unauthenticated request tries to
	 * access a protected endpoint (e.g. no token, or an invalid token).
	 *
	 * Without this bean, Spring Security's default behavior returns 403
	 * Forbidden for missing/invalid authentication, which is misleading —
	 * 403 should mean "you're logged in but not allowed here," while 401
	 * should mean "we don't know who you are." This bean makes that
	 * distinction correct, and also returns a clean JSON error body matching
	 * the rest of the API's error format, instead of a default HTML/blank
	 * error page.
	 */
	@Bean
	public AuthenticationEntryPoint authenticationEntryPoint() {
		return (request, response, authException) -> {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.setContentType("application/json");
			response.getWriter().write(
					"{\"success\":false,\"error\":{\"code\":\"UNAUTHORIZED\",\"message\":\"Authentication required\"}}");
		};
	}

	/**
	 * Configures Spring Security for the application.
	 */
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http
				// Apply the CORS rules defined above to every request.
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))

				// Disable CSRF because this application uses stateless JWT authentication.
				.csrf(AbstractHttpConfigurer::disable)

				// Do not create or maintain HTTP sessions.
				// Each request must provide its own JWT token for authentication.
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				// Use our custom entry point so missing/invalid authentication
				// returns a proper 401 with clean JSON, instead of the default 403.
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint(authenticationEntryPoint()))

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