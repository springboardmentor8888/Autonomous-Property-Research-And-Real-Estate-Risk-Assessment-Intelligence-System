package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.ApiResponse;
import com.realestate.duediligence.dto.NotificationDto;
import com.realestate.duediligence.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final AdminService adminService;

    public NotificationController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications() {
        List<NotificationDto> notifications = adminService.getNotifications();
        return ResponseEntity.ok(ApiResponse.ok(notifications));
    }
}
