package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.AuthResponse;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.entity.Role;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.security.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for UserService. All collaborators are mocked, so these
 * run without a database, Spring context, or network.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private JwtUtil jwtUtil;

	@Mock
	private AuditService auditService;

	@InjectMocks
	private UserService userService;

	// ---------- register ----------

	@Test
	@DisplayName("register: hashes the password, saves the user, returns a token")
	void register_success() {
		RegisterRequest request = registerRequest("Test Buyer", "buyer@example.com", "SecurePass123", Role.BUYER);

		when(passwordEncoder.encode("SecurePass123")).thenReturn("hashed-value");
		// Simulate the database assigning an id on save.
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
			User saved = invocation.getArgument(0);
			saved.setId(1L);
			return saved;
		});
		when(jwtUtil.generateToken("buyer@example.com", "BUYER")).thenReturn("jwt-token");

		AuthResponse response = userService.register(request);

		assertThat(response.getToken()).isEqualTo("jwt-token");
		assertThat(response.getId()).isEqualTo(1L);
		assertThat(response.getEmail()).isEqualTo("buyer@example.com");
		assertThat(response.getRole()).isEqualTo(Role.BUYER);

		// The plain-text password must never reach the database.
		ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
		verify(userRepository).save(savedUser.capture());
		assertThat(savedUser.getValue().getPassword()).isEqualTo("hashed-value");

		verify(auditService).log(eq("buyer@example.com"), eq("REGISTER"), anyString());
	}

	@Test
	@DisplayName("register: rejects an email that is already registered")
	void register_duplicateEmail() {
		RegisterRequest request = registerRequest("Someone", "taken@example.com", "SecurePass123", Role.BUYER);
		when(userRepository.findByEmail("taken@example.com")).thenReturn(Optional.of(new User()));

		assertThatThrownBy(() -> userService.register(request))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessage("Email is already registered");

		verify(userRepository, never()).save(any());
	}

	@Test
	@DisplayName("register: blocks self-registration as ADMINISTRATOR")
	void register_administratorBlocked() {
		RegisterRequest request = registerRequest("Sneaky", "sneaky@example.com", "SecurePass123", Role.ADMINISTRATOR);

		assertThatThrownBy(() -> userService.register(request))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessage("Administrator accounts cannot be self-registered.");

		verify(userRepository, never()).save(any());
	}

	// ---------- login ----------

	@Test
	@DisplayName("login: valid credentials return a token carrying the user's role")
	void login_success() {
		User user = new User();
		user.setId(7L);
		user.setFullName("Test Reviewer");
		user.setEmail("reviewer@example.com");
		user.setPassword("stored-hash");
		user.setRole(Role.LEGAL_REVIEWER);

		when(userRepository.findByEmail("reviewer@example.com")).thenReturn(Optional.of(user));
		when(passwordEncoder.matches("SecurePass123", "stored-hash")).thenReturn(true);
		when(jwtUtil.generateToken("reviewer@example.com", "LEGAL_REVIEWER")).thenReturn("jwt-token");

		AuthResponse response = userService.login(loginRequest("reviewer@example.com", "SecurePass123"));

		assertThat(response.getToken()).isEqualTo("jwt-token");
		assertThat(response.getRole()).isEqualTo(Role.LEGAL_REVIEWER);
		verify(auditService).log("reviewer@example.com", "LOGIN", null);
	}

	@Test
	@DisplayName("login: wrong password is rejected and no token is issued")
	void login_wrongPassword() {
		User user = new User();
		user.setEmail("reviewer@example.com");
		user.setPassword("stored-hash");
		user.setRole(Role.BUYER);

		when(userRepository.findByEmail("reviewer@example.com")).thenReturn(Optional.of(user));
		when(passwordEncoder.matches("wrong-password", "stored-hash")).thenReturn(false);

		assertThatThrownBy(() -> userService.login(loginRequest("reviewer@example.com", "wrong-password")))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessage("Invalid email or password");

		verify(jwtUtil, never()).generateToken(anyString(), anyString());
		verify(auditService, never()).log(anyString(), anyString(), any());
	}

	@Test
	@DisplayName("login: unknown email gives the same message as a wrong password")
	void login_unknownEmail_doesNotRevealWhichPartWasWrong() {
		when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> userService.login(loginRequest("nobody@example.com", "whatever123")))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessage("Invalid email or password");
	}

	// ---------- helpers ----------

	private RegisterRequest registerRequest(String fullName, String email, String password, Role role) {
		RegisterRequest request = new RegisterRequest();
		request.setFullName(fullName);
		request.setEmail(email);
		request.setPassword(password);
		request.setRole(role);
		return request;
	}

	private LoginRequest loginRequest(String email, String password) {
		LoginRequest request = new LoginRequest();
		request.setEmail(email);
		request.setPassword(password);
		return request;
	}
}