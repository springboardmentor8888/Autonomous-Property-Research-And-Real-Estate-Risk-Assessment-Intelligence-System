package com.duedilligenceagent.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.duedilligenceagent.backend.dto.DashboardResponse;
import com.duedilligenceagent.backend.entities.Role;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.RoleRepository;
import com.duedilligenceagent.backend.repositories.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin-only statistics and user management. Role enforcement happens in
 * {@link com.duedilligenceagent.backend.config.SecurityConfig}.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PropertyRepository propertyRepository;

    public AdminController(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PropertyRepository propertyRepository) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.propertyRepository = propertyRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getAdminDashboard() {

        long totalUsers = userRepository.count();
        long totalProperties = propertyRepository.count();

        Role adminRole = roleRepository.findByName("ADMINISTRATOR")
                .orElseThrow(() -> new RuntimeException("ADMINISTRATOR role not found"));

        long totalAdmins = userRepository.findAll()
                .stream()
                .filter(user -> user.getRoleId().equals(adminRole.getId()))
                .count();

        DashboardResponse response = new DashboardResponse(
                totalUsers,
                totalProperties,
                totalAdmins
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserAdminResponse>> getUsers() {
        List<User> users = userRepository.findAllWithRoles();
        List<UserAdminResponse> response = users.stream()
                .map(this::toAdminResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private UserAdminResponse toAdminResponse(User user) {
        String roleName = user.getRole() != null ? user.getRole().getName() : "UNKNOWN";
        return new UserAdminResponse(
                user.getUserId(),
                user.getEmail(),
                roleName,
                user.getIsActive(),
                user.getCreatedAt().toString()
        );
    }

    public record UserAdminResponse(
            Long userId,
            String email,
            String roleName,
            Boolean isActive,
            String createdAt
    ) {}
}