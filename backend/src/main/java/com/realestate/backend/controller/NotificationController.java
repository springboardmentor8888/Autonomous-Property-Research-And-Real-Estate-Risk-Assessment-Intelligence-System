package com.realestate.backend.controller;

import com.realestate.backend.entity.Notification;
import com.realestate.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

private final NotificationService notificationService;

public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
}

@PostMapping
public ResponseEntity<Notification> createNotification(
        @RequestBody Notification notification) {

    return ResponseEntity.ok(
            notificationService.createNotification(notification)
    );
}

@GetMapping
public ResponseEntity<List<Notification>> getAllNotifications() {

    return ResponseEntity.ok(
            notificationService.getAllNotifications()
    );
}

@GetMapping("/{id}")
public ResponseEntity<Notification> getNotificationById(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            notificationService.getNotificationById(id)
    );
}

@GetMapping("/property/{propertyId}")
public ResponseEntity<List<Notification>> getNotificationsByPropertyId(
        @PathVariable Long propertyId) {

    return ResponseEntity.ok(
            notificationService.getNotificationsByPropertyId(propertyId)
    );
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteNotification(
        @PathVariable Long id) {

    notificationService.deleteNotification(id);

    return ResponseEntity.noContent().build();
}

}