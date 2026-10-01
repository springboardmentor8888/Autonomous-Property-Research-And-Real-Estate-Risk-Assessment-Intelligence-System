package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.entities.Notification;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.NotificationRepository;
import com.duedilligenceagent.backend.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Verifies the notification service (SRS 1.11): in-app notifications are
 * always persisted; the email copy is sent only when an SMTP sender bean
 * exists and never breaks the caller.
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private UserRepository userRepository;
    @Mock private ObjectProvider<JavaMailSender> mailSenderProvider;
    @Mock private JavaMailSender mailSender;

    @InjectMocks private NotificationService service;

    private static User user(long id, String email) {
        return User.builder().userId(id).email(email).build();
    }

    @Test
    void notifyPersistsUnreadNotification() {
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> {
                    Notification n = invocation.getArgument(0);
                    n.setNotificationId(42L);
                    return n;
                });

        Notification notification = service.notify(7L, NotificationService.TYPE_REPORT_READY,
                "Report ready for property #1001", 1001L, 55L);

        assertThat(notification.getNotificationId()).isEqualTo(42L);
        assertThat(notification.getUserId()).isEqualTo(7L);
        assertThat(notification.getNotificationType()).isEqualTo(NotificationService.TYPE_REPORT_READY);
        assertThat(notification.getStatus()).isEqualTo("UNREAD");
        assertThat(notification.getPropertyId()).isEqualTo(1001L);
        assertThat(notification.getReportId()).isEqualTo(55L);
    }

    @Test
    void notifySkipsEmailWhenSmtpNotConfigured() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(null);
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> {
                    Notification n = invocation.getArgument(0);
                    n.setNotificationId(1L);
                    return n;
                });

        service.notify(7L, NotificationService.TYPE_REPORT_READY, "msg", null, null);

        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void notifyEmailsCopyWhenSmtpConfigured() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user(7L, "buyer@example.com")));
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> {
                    Notification n = invocation.getArgument(0);
                    n.setNotificationId(1L);
                    return n;
                });

        service.notify(7L, NotificationService.TYPE_MONITORING_UPDATE,
                "Flood zone changed for property #1004", 1004L, null);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        assertThat(captor.getValue().getTo()).containsExactly("buyer@example.com");
        assertThat(captor.getValue().getSubject()).contains("MONITORING UPDATE");
        assertThat(captor.getValue().getText()).isEqualTo("Flood zone changed for property #1004");
    }

    @Test
    void notifySwallowsEmailFailure() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user(7L, "buyer@example.com")));
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> {
                    Notification n = invocation.getArgument(0);
                    n.setNotificationId(1L);
                    return n;
                });
        org.mockito.Mockito.doThrow(new RuntimeException("SMTP down"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        Notification notification = service.notify(7L, NotificationService.TYPE_REPORT_READY,
                "msg", null, null);

        // The in-app notification is still returned despite the email failure.
        assertThat(notification).isNotNull();
        assertThat(notification.getStatus()).isEqualTo("UNREAD");
    }

    @Test
    void markReadUpdatesStatusAndSetsSentAt() {
        Notification unread = Notification.builder()
                .notificationId(9L).userId(7L).notificationType(NotificationService.TYPE_REPORT_READY)
                .message("msg").status("UNREAD").build();
        when(notificationRepository.findById(9L)).thenReturn(Optional.of(unread));
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Notification read = service.markRead(9L, 7L);

        assertThat(read.getStatus()).isEqualTo("READ");
        assertThat(read.getSentAt()).isNotNull();
    }

    @Test
    void markReadRejectsOtherUsersNotification() {
        Notification other = Notification.builder()
                .notificationId(9L).userId(99L).notificationType(NotificationService.TYPE_REPORT_READY)
                .message("msg").status("UNREAD").build();
        when(notificationRepository.findById(9L)).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> service.markRead(9L, 7L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void unreadCountCountsOnlyUnread() {
        when(notificationRepository.countByUserIdAndStatusIgnoreCase(7L, "UNREAD")).thenReturn(3L);

        assertThat(service.unreadCount(7L)).isEqualTo(3L);
    }

    @Test
    void listForUserReturnsNewestFirst() {
        Notification newer = Notification.builder().notificationId(2L).userId(7L)
                .notificationType(NotificationService.TYPE_REPORT_READY).message("new").status("UNREAD").build();
        Notification older = Notification.builder().notificationId(1L).userId(7L)
                .notificationType(NotificationService.TYPE_REPORT_READY).message("old").status("READ").build();
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(7L))
                .thenReturn(List.of(newer, older));

        List<Notification> notifications = service.listForUser(7L);

        assertThat(notifications).containsExactly(newer, older);
    }
}
