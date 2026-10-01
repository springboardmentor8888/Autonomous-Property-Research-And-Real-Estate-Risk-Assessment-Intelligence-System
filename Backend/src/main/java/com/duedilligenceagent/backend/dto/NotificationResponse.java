package com.duedilligenceagent.backend.dto;

/**
 * Notification payload for the bell-icon inbox (SRS 1.11). A flat view of
 * the notification row — the lazy user relation is deliberately excluded
 * so the response serializes outside a persistence session.
 */
public record NotificationResponse(
        Long notificationId,
        String notificationType,
        String message,
        Long propertyId,
        Long reportId,
        String status,
        String sentAt,
        String createdAt
) {}
