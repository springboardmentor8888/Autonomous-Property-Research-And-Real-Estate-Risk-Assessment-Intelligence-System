package com.realestate.duediligence.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for JwtUtil. The @Value fields are set directly with
 * ReflectionTestUtils, so no Spring context or properties file is needed.
 */
class JwtUtilTest {

	private static final String SECRET = "unit-test-secret-key-that-is-at-least-32-bytes-long";
	private static final String OTHER_SECRET = "a-completely-different-secret-key-also-long-enough";
	private static final long ONE_HOUR_MS = 3_600_000L;

	private JwtUtil jwtUtil(String secret, long expirationMs) {
		JwtUtil util = new JwtUtil();
		ReflectionTestUtils.setField(util, "secret", secret);
		ReflectionTestUtils.setField(util, "expiration", expirationMs);
		return util;
	}

	@Test
	@DisplayName("a generated token is valid and carries the email and role")
	void generatedToken_isValid_andCarriesEmailAndRole() {
		JwtUtil util = jwtUtil(SECRET, ONE_HOUR_MS);

		String token = util.generateToken("user@example.com", "BUYER");

		assertThat(util.isTokenValid(token)).isTrue();
		assertThat(util.extractEmail(token)).isEqualTo("user@example.com");
		assertThat(util.extractRole(token)).isEqualTo("BUYER");
	}

	@Test
	@DisplayName("a token signed with a different secret is rejected")
	void tokenSignedWithAnotherSecret_isRejected() {
		String forgedToken = jwtUtil(OTHER_SECRET, ONE_HOUR_MS).generateToken("user@example.com", "ADMINISTRATOR");

		assertThat(jwtUtil(SECRET, ONE_HOUR_MS).isTokenValid(forgedToken)).isFalse();
	}

	@Test
	@DisplayName("an expired token is rejected")
	void expiredToken_isRejected() {
		JwtUtil util = jwtUtil(SECRET, -1000L); // already expired when issued

		String token = util.generateToken("user@example.com", "BUYER");

		assertThat(util.isTokenValid(token)).isFalse();
	}

	@Test
	@DisplayName("a garbage string is rejected without throwing")
	void garbageToken_isRejected() {
		assertThat(jwtUtil(SECRET, ONE_HOUR_MS).isTokenValid("this-is-not-a-jwt")).isFalse();
	}
}