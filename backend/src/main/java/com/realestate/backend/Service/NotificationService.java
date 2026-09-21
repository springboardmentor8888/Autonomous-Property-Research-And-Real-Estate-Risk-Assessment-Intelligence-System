package com.realestate.backend.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.Notification;
import com.realestate.backend.Repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailNotificationService emailNotificationService;

    public Notification createNotification(
            Long propertyId,
            String recipient,
            String type,
            String message) {

        Notification notification = new Notification();

        notification.setPropertyId(propertyId);
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(java.time.LocalDateTime.now());

        Notification savedNotification =
                notificationRepository.save(notification);

        // Send email notification
        try {
            emailNotificationService.sendEmail(
                    recipient,
                    "Real Estate Notification - " + type,
                    message
            );
        } catch (Exception e) {
            System.out.println(
                    "Email notification failed: " + e.getMessage()
            );
        }

        return savedNotification;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notification> getNotificationsByPropertyId(Long propertyId) {
        return notificationRepository.findByPropertyId(propertyId);
    }

    public Notification markAsRead(Long id) {

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Notification not found with id: " + id));

        notification.setRead(true);

        return notificationRepository.save(notification);
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}