package com.duedilligenceagent.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.duedilligenceagent.backend.dto.DashboardResponse;
import com.duedilligenceagent.backend.entities.ActivityLog;
import com.duedilligenceagent.backend.entities.ApiLog;
import com.duedilligenceagent.backend.entities.Role;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.repositories.ActivityLogRepository;
import com.duedilligenceagent.backend.repositories.ApiLogRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.RoleRepository;
import com.duedilligenceagent.backend.repositories.UserRepository;

import java.time.Duration;
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
    private final ApiLogRepository apiLogRepository;
    private final ActivityLogRepository activityLogRepository;

    public AdminController(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PropertyRepository propertyRepository,
            ApiLogRepository apiLogRepository,
            ActivityLogRepository activityLogRepository) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.propertyRepository = propertyRepository;
        this.apiLogRepository = apiLogRepository;
        this.activityLogRepository = activityLogRepository;
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

    /** Paged API audit trail, newest first; optional ?success= filter (SRS 1.14). */
    @GetMapping("/logs/api")
    public ResponseEntity<LogPageResponse<ApiLogResponse>> getApiLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean success) {

        Pageable pageable = PageRequest.of(
                Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "requestTime"));

        Page<ApiLog> logs = success != null
                ? apiLogRepository.findBySuccessOrderByRequestTimeDesc(success, pageable)
                : apiLogRepository.findByOrderByRequestTimeDesc(pageable);

        List<ApiLogResponse> content = logs.getContent().stream()
                .map(this::toApiLogResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new LogPageResponse<>(
                content, logs.getNumber(), logs.getSize(),
                logs.getTotalElements(), logs.getTotalPages()));
    }

    /** Paged user activity trail, newest first. */
    @GetMapping("/logs/activity")
    public ResponseEntity<LogPageResponse<ActivityLogResponse>> getActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(
                Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<ActivityLog> logs = activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<ActivityLogResponse> content = logs.getContent().stream()
                .map(this::toActivityLogResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new LogPageResponse<>(
                content, logs.getNumber(), logs.getSize(),
                logs.getTotalElements(), logs.getTotalPages()));
    }

    private ApiLogResponse toApiLogResponse(ApiLog log) {
        Long latencyMs = log.getResponseTime() != null
                ? Duration.between(log.getRequestTime(), log.getResponseTime()).toMillis()
                : null;
        return new ApiLogResponse(
                log.getApiLogId(),
                log.getServiceName(),
                log.getEndpoint(),
                log.getRequestTime().toString(),
                log.getResponseTime() != null ? log.getResponseTime().toString() : null,
                log.getStatusCode(),
                log.getSuccess(),
                latencyMs,
                log.getErrorMessage()
        );
    }

    private ActivityLogResponse toActivityLogResponse(ActivityLog log) {
        return new ActivityLogResponse(
                log.getActivityLogId(),
                log.getUserId(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getCreatedAt().toString()
        );
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

    public record ApiLogResponse(
            Long id,
            String serviceName,
            String endpoint,
            String requestTime,
            String responseTime,
            Integer statusCode,
            Boolean success,
            Long latencyMs,
            String errorMessage
    ) {}

    public record ActivityLogResponse(
            Long id,
            Long userId,
            String action,
            String entityType,
            Long entityId,
            String createdAt
    ) {}

    public record LogPageResponse<T>(
            List<T> content,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {}
}