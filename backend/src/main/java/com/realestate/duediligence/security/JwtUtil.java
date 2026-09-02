package com.realestate.duediligence.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Utility class responsible for creating, reading, and validating JWT tokens.
 *
 * JWT is used to authenticate users after they successfully log in.
 */
@Component
public class JwtUtil {

	// Reads the JWT secret key from application.properties.
	// This key is used to sign and verify JWT tokens.
	@Value("${jwt.secret}")
	private String secret;

	// Reads the JWT expiration time from application.properties.
	// The value is specified in milliseconds.
	@Value("${jwt.expiration}")
	private long expiration;

	/**
	 * Creates the secret key used for signing and verifying JWT tokens.
	 */
	private SecretKey getSigningKey() {
		return Keys.hmacShaKeyFor(secret.getBytes());
	}

	/**
	 * Generates a JWT token for the given user's email.
	 *
	 * The email is stored as the subject of the token. The token also contains its
	 * issue time and expiration time.
	 */
	public String generateToken(String email) {
		return Jwts.builder().subject(email).issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + expiration)).signWith(getSigningKey()).compact();
	}

	/**
	 * Extracts the user's email from a JWT token.
	 *
	 * Before reading the token, its signature is verified using the secret key.
	 */
	public String extractEmail(String token) {
		return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload().getSubject();
	}

	/**
	 * Checks whether the JWT token is valid.
	 *
	 * If the token is correctly signed, not expired, and can be parsed, the method
	 * returns true. Otherwise, it returns false.
	 */
	public boolean isTokenValid(String token) {
		try {
			Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);

			return true;

		} catch (Exception e) {
			// Invalid, expired, or malformed tokens will cause an exception.
			return false;
		}
	}
}