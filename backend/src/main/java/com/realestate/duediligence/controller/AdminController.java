package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.ApiResponse;
import com.realestate.duediligence.dto.AuditLogDto;
import com.realestate.duediligence.dto.UserDto;
import com.realestate.duediligence.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> listUsers() {
        List<UserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogDto>>> getAuditLogs() {
        List<AuditLogDto> auditLogs = adminService.getAuditLogs();
        return ResponseEntity.ok(ApiResponse.ok(auditLogs));
    }
}
