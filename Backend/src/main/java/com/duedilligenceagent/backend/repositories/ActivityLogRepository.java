package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    /** A user's search events, newest first — the basis of their property history. */
    List<ActivityLog> findByUserIdAndActionOrderByCreatedAtDesc(Long userId, String action);
}
