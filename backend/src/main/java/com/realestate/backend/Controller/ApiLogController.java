package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.backend.Entity.ApiLog;
import com.realestate.backend.Service.ApiLogService;

@RestController
@RequestMapping("/api/api-logs")
public class ApiLogController {

    @Autowired
    private ApiLogService apiLogService;

    @PostMapping
    public ApiLog createApiLog(
            @RequestParam String method,
            @RequestParam String endpoint,
            @RequestParam Integer statusCode,
            @RequestParam Long userId) {

        return apiLogService.createApiLog(
                method, endpoint, statusCode, userId);
    }

    @GetMapping
    public List<ApiLog> getAllApiLogs() {
        return apiLogService.getAllApiLogs();
    }

    @GetMapping("/user/{userId}")
    public List<ApiLog> getApiLogsByUserId(
            @PathVariable Long userId) {

        return apiLogService.getApiLogsByUserId(userId);
    }

    @GetMapping("/{id}")
    public ApiLog getApiLogById(
            @PathVariable Long id) {

        return apiLogService.getApiLogById(id);
    }
}