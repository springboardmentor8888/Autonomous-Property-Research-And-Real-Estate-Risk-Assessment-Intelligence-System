package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndStatusIgnoreCase(Long userId, String status);

    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.sentAt = COALESCE(n.sentAt, CURRENT_TIMESTAMP) "
            + "WHERE n.userId = :userId AND lower(n.status) = 'unread'")
    int markAllRead(@Param("userId") Long userId);
}
