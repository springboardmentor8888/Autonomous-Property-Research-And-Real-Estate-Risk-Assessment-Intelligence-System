package com.realestate.duediligence.dto;

import com.realestate.duediligence.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Safe view of a user for the admin list. Deliberately excludes the password
 * hash, which must never be returned by any API.
 */
@Data
@AllArgsConstructor
public class UserSummaryResponse {

	private Long id;
	private String fullName;
	private String email;
	private Role role;
}