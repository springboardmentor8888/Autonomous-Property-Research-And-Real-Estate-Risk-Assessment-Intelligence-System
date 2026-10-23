package com.realestate.duediligence.security;

import com.realestate.duediligence.config.SecurityConfig;
import com.realestate.duediligence.controller.AdminController;
import com.realestate.duediligence.controller.HealthController;
import com.realestate.duediligence.controller.PropertyController;
import com.realestate.duediligence.entity.Role;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.AuditLogRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.AuditService;
import com.realestate.duediligence.service.NotificationService;
import com.realestate.duediligence.service.PropertyService;
import com.realestate.duediligence.service.ReportService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration test for the security layer. The real JwtAuthFilter,
 * SecurityConfig, JwtUtil and GlobalExceptionHandler are loaded; only
 * services and repositories are mocked. Requests go through MockMvc, so
 * no database, API key, or running server is needed.
 *
 * Tokens are generated with the real JwtUtil, so the whole chain
 * (token -> filter -> authority -> @PreAuthorize -> handler -> JSON)
 * is exercised, not just individual pieces.
 */
@WebMvcTest(
		controllers = { PropertyController.class, AdminController.class, HealthController.class },
		properties = {
				"jwt.secret=" + SecurityIntegrationTest.SECRET,
				"jwt.expiration=3600000"
		})
@Import({ SecurityConfig.class, JwtUtil.class, JwtAuthFilter.class })
class SecurityIntegrationTest {

	static final String SECRET = "integration-test-secret-key-at-least-32-bytes-long";
	private static final String OTHER_SECRET = "a-completely-different-secret-key-also-long-enough";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JwtUtil jwtUtil;

	// Collaborators of the controllers under test (their logic is not what is tested here).
	@MockitoBean
	private PropertyService propertyService;
	@MockitoBean
	private ReportService reportService;
	@MockitoBean
	private NotificationService notificationService;
	@MockitoBean
	private AuditService auditService;
	@MockitoBean
	private AuditLogRepository auditLogRepository;
	@MockitoBean
	private UserRepository userRepository;
	@MockitoBean
	private PropertyRepository propertyRepository;

	// ---------- public vs protected ----------

	@Test
	@DisplayName("/api/health is public: no token needed")
	void health_isPublic() throws Exception {
		mockMvc.perform(get("/api/health"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("UP"));
	}

	@Test
	@DisplayName("a protected endpoint without a token returns 401 with our JSON error")
	void protectedEndpoint_withoutToken_returns401() throws Exception {
		mockMvc.perform(get("/api/properties/search").param("address", "lakeview"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.success").value(false))
				.andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
	}

	@Test
	@DisplayName("a garbage token returns 401")
	void protectedEndpoint_withGarbageToken_returns401() throws Exception {
		mockMvc.perform(get("/api/properties/search").param("address", "lakeview")
						.header("Authorization", "Bearer this-is-not-a-jwt"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	@DisplayName("an expired token returns 401")
	void protectedEndpoint_withExpiredToken_returns401() throws Exception {
		JwtUtil expiredIssuer = new JwtUtil();
		ReflectionTestUtils.setField(expiredIssuer, "secret", SECRET);
		ReflectionTestUtils.setField(expiredIssuer, "expiration", -1000L); // expired when issued
		String expiredToken = expiredIssuer.generateToken("buyer@example.com", "BUYER");

		mockMvc.perform(get("/api/properties/search").param("address", "lakeview")
						.header("Authorization", "Bearer " + expiredToken))
				.andExpect(status().isUnauthorized());
	}

	@Test
	@DisplayName("a token signed with a different secret (forged) returns 401")
	void protectedEndpoint_withForgedToken_returns401() throws Exception {
		JwtUtil forger = new JwtUtil();
		ReflectionTestUtils.setField(forger, "secret", OTHER_SECRET);
		ReflectionTestUtils.setField(forger, "expiration", 3_600_000L);
		String forgedAdminToken = forger.generateToken("attacker@example.com", "ADMINISTRATOR");

		mockMvc.perform(get("/api/admin/users")
						.header("Authorization", "Bearer " + forgedAdminToken))
				.andExpect(status().isUnauthorized());
	}

	@Test
	@DisplayName("a valid token reaches a protected endpoint")
	void protectedEndpoint_withValidToken_returns200() throws Exception {
		mockMvc.perform(get("/api/properties/search").param("address", "lakeview")
						.header("Authorization", bearer("buyer@example.com", "BUYER")))
				.andExpect(status().isOk());
	}

	// ---------- role-based access control ----------

	@Test
	@DisplayName("admin-check as BUYER returns 403 (not 500) with our JSON error")
	void adminCheck_asBuyer_returns403() throws Exception {
		mockMvc.perform(get("/api/properties/admin-check")
						.header("Authorization", bearer("buyer@example.com", "BUYER")))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
	}

	@Test
	@DisplayName("admin-check as ADMINISTRATOR returns 200")
	void adminCheck_asAdministrator_returns200() throws Exception {
		mockMvc.perform(get("/api/properties/admin-check")
						.header("Authorization", bearer("admin@example.com", "ADMINISTRATOR")))
				.andExpect(status().isOk())
				.andExpect(content().string(containsString("access granted")));
	}

	@Test
	@DisplayName("/api/admin/users as BUYER returns 403")
	void adminUsers_asBuyer_returns403() throws Exception {
		mockMvc.perform(get("/api/admin/users")
						.header("Authorization", bearer("buyer@example.com", "BUYER")))
				.andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("/api/admin/users as ADMINISTRATOR lists users and never exposes passwords")
	void adminUsers_asAdministrator_returns200_withoutPasswords() throws Exception {
		User user = new User();
		user.setId(1L);
		user.setFullName("Test Buyer");
		user.setEmail("buyer@example.com");
		user.setPassword("this-hash-must-never-leave-the-server");
		user.setRole(Role.BUYER);
		when(userRepository.findAll()).thenReturn(List.of(user));

		mockMvc.perform(get("/api/admin/users")
						.header("Authorization", bearer("admin@example.com", "ADMINISTRATOR")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].email").value("buyer@example.com"))
				.andExpect(jsonPath("$[0].password").doesNotExist());
	}

	// ---------- input validation ----------

	@Test
	@DisplayName("a too-short address is rejected with 400 VALIDATION_ERROR, not 500")
	void validateAddress_tooShort_returns400() throws Exception {
		mockMvc.perform(post("/api/properties/validate-address")
						.header("Authorization", bearer("buyer@example.com", "BUYER"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"address\":\"abc\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
				.andExpect(jsonPath("$.error.message", containsString("address")));
	}

	// ---------- helper ----------

	private String bearer(String email, String role) {
		return "Bearer " + jwtUtil.generateToken(email, role);
	}
}