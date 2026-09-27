package com.realestate.backend.service.impl;

import com.realestate.backend.entity.Notification;
import com.realestate.backend.exception.ResourceNotFoundException;
import com.realestate.backend.repository.NotificationRepository;
import com.realestate.backend.service.NotificationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

private final NotificationRepository notificationRepository;

public NotificationServiceImpl(
        NotificationRepository notificationRepository) {
    this.notificationRepository = notificationRepository;
}

@Override
public Notification createNotification(Notification notification) {
    return notificationRepository.save(notification);
}

@Override
public Notification getNotificationById(Long id) {
    return notificationRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Notification not found with ID: " + id
                    )
            );
}

@Override
public List<Notification> getAllNotifications() {
    return notificationRepository.findAll();
}

@Override
public List<Notification> getNotificationsByPropertyId(
        Long propertyId) {

    return notificationRepository.findByPropertyId(propertyId);
}

@Override
public void deleteNotification(Long id) {
    Notification notification = getNotificationById(id);
    notificationRepository.delete(notification);
}

}