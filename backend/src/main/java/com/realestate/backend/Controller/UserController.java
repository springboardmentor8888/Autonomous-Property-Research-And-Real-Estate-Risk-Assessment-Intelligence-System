package com.realestate.backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.backend.Entity.LoginRequest;
import com.realestate.backend.Entity.LoginResponse;
import com.realestate.backend.Entity.User;
import com.realestate.backend.Service.UserService;
import com.realestate.backend.dto.UpdateRoleRequest;
import com.realestate.backend.dto.UpdateUserRequest;
import com.realestate.backend.dto.UserResponse;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(@RequestBody User user) {

        UserResponse registeredUser = userService.registerUser(user);

        return ResponseEntity.ok(registeredUser);
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(
            @RequestBody LoginRequest loginRequest) {

        LoginResponse response = userService.loginUser(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        return ResponseEntity.ok(response);
    }
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable Long id) {

        UserResponse userProfile = userService.getUserProfile(id);

        return ResponseEntity.ok(userProfile);
    }
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUserProfile(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {

        UserResponse updatedUser =
                userService.updateUserProfile(id, request);

        return ResponseEntity.ok(updatedUser);
    }
    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody UpdateRoleRequest request) {

        UserResponse updatedUser =
                userService.updateUserRole(id, request);

        return ResponseEntity.ok(updatedUser);
    }
    @GetMapping("/agent-test")
    public ResponseEntity<String> agentTest() {
        return ResponseEntity.ok("Real Estate Agent access granted");
    }
}