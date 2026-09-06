package com.realestate.duediligence.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Utility class responsible for generating and validating JWT tokens.
 *
 * Handles embedding user identity (email) and role into the token, and
 * later reading that information back out on subsequent requests.
 */
@Component
public class JwtUtil {

	@Value("${jwt.secret}")
	private String secret;

	@Value("${jwt.expiration}")
	private long expiration;

	private SecretKey getSigningKey() {
		return Keys.hmacShaKeyFor(secret.getBytes());
	}

	/**
	 * Generates a signed JWT token containing the user's email and role.
	 */
	public String generateToken(String email, String role) {
		return Jwts.builder()
				.subject(email)
				.claim("role", role)
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + expiration))
				.signWith(getSigningKey())
				.compact();
	}

	/**
	 * Extracts the email (subject) stored inside a valid token.
	 */
	public String extractEmail(String token) {
		return Jwts.parser()
				.verifyWith(getSigningKey())
				.build()
				.parseSignedClaims(token)
				.getPayload()
				.getSubject();
	}

	/**
	 * Extracts the role stored inside a valid token.
	 */
	public String extractRole(String token) {
		return Jwts.parser()
				.verifyWith(getSigningKey())
				.build()
				.parseSignedClaims(token)
				.getPayload()
				.get("role", String.class);
	}

	/**
	 * Checks whether a token is valid (correct signature, not expired).
	 */
	public boolean isTokenValid(String token) {
		try {
			Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
			return true;
		} catch (Exception e) {
			return false;
		}
	}
}