package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    /** A user's search events, newest first — the basis of their property history. */
    List<ActivityLog> findByUserIdAndActionOrderByCreatedAtDesc(Long userId, String action);

    /** Every activity event, newest first — the admin audit viewer. */
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /** Search events within a window — the admin search-trend metric. */
    long countByActionAndCreatedAtAfter(String action, LocalDateTime since);

    /** Entity ids ranked by event count for an action — top searched properties. */
    @Query("SELECT a.entityId, COUNT(a) FROM ActivityLog a "
            + "WHERE a.action = :action AND a.entityId IS NOT NULL "
            + "GROUP BY a.entityId ORDER BY COUNT(a) DESC")
    List<Object[]> topEntitiesByAction(@Param("action") String action, Pageable pageable);
}
