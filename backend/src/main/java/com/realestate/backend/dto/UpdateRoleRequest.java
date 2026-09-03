package com.realestate.backend.dto;

import com.realestate.backend.Entity.Role;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateRoleRequest {

    private Role role;
}