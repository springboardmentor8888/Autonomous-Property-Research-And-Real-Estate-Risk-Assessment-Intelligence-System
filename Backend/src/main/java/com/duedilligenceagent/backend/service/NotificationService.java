package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.entities.Notification;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.NotificationRepository;
import com.duedilligenceagent.backend.repositories.UserRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * In-app notifications (SRS 1.11): every notification is persisted for the
 * bell-icon inbox; an email copy is additionally sent when an SMTP host is
 * configured (spring.mail.host). Without SMTP config the email is skipped
 * gracefully — send failures never propagate to the caller.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    public static final String TYPE_REPORT_READY = "REPORT_READY";
    public static final String TYPE_MONITORING_UPDATE = "MONITORING_UPDATE";

    private static final String STATUS_UNREAD = "UNREAD";
    private static final String STATUS_READ = "READ";

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    /**
     * Creates an in-app notification and, when SMTP is configured, emails a
     * copy to the user. Never throws on email failure.
     */
    @Transactional
    public Notification notify(Long userId, String type, String message,
                               Long propertyId, Long reportId) {
        Notification notification = notificationRepository.save(Notification.builder()
                .userId(userId)
                .notificationType(type)
                .message(message)
                .propertyId(propertyId)
                .reportId(reportId)
                .status(STATUS_UNREAD)
                .build());

        sendEmailQuietly(userId, type, message, notification.getNotificationId());
        return notification;
    }

    /** The user's notifications, newest first. */
    @Transactional(readOnly = true)
    public List<Notification> listForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /** Unread count for the bell-icon badge. */
    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndStatusIgnoreCase(userId, STATUS_UNREAD);
    }

    /** Marks one notification read for the owner; 404 when not found. */
    @Transactional
    public Notification markRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .filter(n -> n.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found with id: " + notificationId));
        if (!STATUS_READ.equalsIgnoreCase(notification.getStatus())) {
            notification.setStatus(STATUS_READ);
            if (notification.getSentAt() == null) {
                notification.setSentAt(LocalDateTime.now());
            }
            notificationRepository.save(notification);
        }
        return notification;
    }

    /** Marks all of the user's unread notifications read. */
    @Transactional
    public int markAllRead(Long userId) {
        return notificationRepository.markAllRead(userId);
    }

    /**
     * Emails the notification when a JavaMailSender bean exists (i.e.
     * spring.mail.host is configured). Any send error is logged and
     * swallowed — the in-app notification is already durable.
     */
    private void sendEmailQuietly(Long userId, String type, String message, Long notificationId) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.debug("SMTP not configured — email copy of notification id={} skipped", notificationId);
            return;
        }
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
                log.debug("No email address for user id={} — notification id={} email skipped",
                        userId, notificationId);
                return;
            }
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(user.getEmail());
            mail.setSubject("[Due Diligence Agent] " + type.replace('_', ' '));
            mail.setText(message);
            mailSender.send(mail);
            log.info("Emailed notification id={} to user id={}", notificationId, userId);
        } catch (Exception ex) {
            log.warn("Failed to email notification id={} to user id={}: {}",
                    notificationId, userId, ex.getMessage());
        }
    }
}
