package com.realestate.backend.Entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String message;
    private String token;
}