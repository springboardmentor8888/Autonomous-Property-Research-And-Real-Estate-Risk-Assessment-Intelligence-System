package com.duedilligenceagent.backend.controller;

import com.duedilligenceagent.backend.dto.NotificationResponse;
import com.duedilligenceagent.backend.entities.Notification;
import com.duedilligenceagent.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.repositories.UserRepository;

import java.util.List;
import java.util.Map;

/**
 * In-app notification endpoints (SRS 1.11): bell-icon inbox, unread count
 * and mark-read, all requiring a valid access token.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService,
                                  UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    /** The current user's notifications, newest first. */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> list(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<NotificationResponse> response = notificationService
                .listForUser(userIdOf(userDetails))
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    /** Unread count for the bell-icon badge. */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(Map.of(
                "unread", notificationService.unreadCount(userIdOf(userDetails))
        ));
    }

    /** Marks one notification read for the current user. */
    @PostMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        return ResponseEntity.ok(
                toResponse(notificationService.markRead(id, userIdOf(userDetails)))
        );
    }

    /** Marks all of the current user's unread notifications read. */
    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllRead(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(Map.of(
                "markedRead", notificationService.markAllRead(userIdOf(userDetails))
        ));
    }

    /** Resolves the authenticated user's id from the JWT principal. */
    private Long userIdOf(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found: " + userDetails.getUsername()));
        return user.getUserId();
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getNotificationId(),
                notification.getNotificationType(),
                notification.getMessage(),
                notification.getPropertyId(),
                notification.getReportId(),
                notification.getStatus(),
                notification.getSentAt() != null ? notification.getSentAt().toString() : null,
                notification.getCreatedAt().toString()
        );
    }
}
