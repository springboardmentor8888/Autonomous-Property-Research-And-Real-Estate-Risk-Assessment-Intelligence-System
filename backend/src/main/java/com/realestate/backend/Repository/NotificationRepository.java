package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {
	List<Notification> findByPropertyId(Long propertyId);

}