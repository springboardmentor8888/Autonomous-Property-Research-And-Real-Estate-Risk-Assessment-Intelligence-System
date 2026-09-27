package com.realestate.backend.service;

import java.util.List;

import com.realestate.backend.entity.Notification;

public interface NotificationService {

Notification createNotification(Notification notification);

Notification getNotificationById(Long id);

List<Notification> getAllNotifications();

List<Notification> getNotificationsByPropertyId(Long propertyId);

void deleteNotification(Long id);

}