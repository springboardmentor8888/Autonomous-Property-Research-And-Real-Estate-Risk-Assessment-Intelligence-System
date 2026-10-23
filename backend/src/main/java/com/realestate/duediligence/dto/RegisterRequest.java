package com.realestate.duediligence.dto;

import com.realestate.duediligence.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Registration input. Validation lives on the server because frontend checks
 * can always be bypassed (Postman, curl).
 */
@Data
public class RegisterRequest {

	@NotBlank(message = "Full name is required")
	@Size(max = 100, message = "Full name must be at most 100 characters")
	private String fullName;

	@NotBlank(message = "Email is required")
	@Email(message = "Email format is invalid")
	private String email;

	@NotBlank(message = "Password is required")
	@Size(min = 8, max = 72, message = "Password must be 8 to 72 characters")
	private String password;

	@NotNull(message = "Role is required")
	private Role role;
}