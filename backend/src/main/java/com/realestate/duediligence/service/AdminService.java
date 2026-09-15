package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.AuditLogDto;
import com.realestate.duediligence.dto.NotificationDto;
import com.realestate.duediligence.dto.UserDto;
import com.realestate.duediligence.entity.AuditLog;
import com.realestate.duediligence.entity.Notification;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.AuditLogRepository;
import com.realestate.duediligence.repository.NotificationRepository;
import com.realestate.duediligence.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;

    public AdminService(UserRepository userRepository, AuditLogRepository auditLogRepository, NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .role(u.getRole() != null ? u.getRole().getRoleName() : "BUYER")
                        .build())
                .collect(Collectors.toList());
    }

    public List<AuditLogDto> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(l -> AuditLogDto.builder()
                        .id(l.getId())
                        .userId(l.getUserId())
                        .action(l.getAction())
                        .timestamp(l.getTimestamp())
                        .build())
                .collect(Collectors.toList());
    }

    public List<NotificationDto> getNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(n -> NotificationDto.builder()
                        .id(n.getId())
                        .type(n.getType())
                        .message(n.getMessage())
                        .read(n.getRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
