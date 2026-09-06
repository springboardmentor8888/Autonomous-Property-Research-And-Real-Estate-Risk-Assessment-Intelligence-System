package com.duedilligenceagent.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.duedilligenceagent.backend.dto.DashboardResponse;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.UserRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    public AdminController(
            UserRepository userRepository,
            PropertyRepository propertyRepository) {

        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getAdminDashboard() {

        long totalUsers = userRepository.count();
        long totalProperties = propertyRepository.count();

        long totalAdmins = userRepository.findAll()
                .stream()
                .filter(user -> user.getRoleId() == 2L)
                .count();

        DashboardResponse response = new DashboardResponse(
                totalUsers,
                totalProperties,
                totalAdmins
        );

        return ResponseEntity.ok(response);
    }
}