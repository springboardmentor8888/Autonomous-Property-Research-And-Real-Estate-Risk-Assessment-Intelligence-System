package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUserEmailOrderByTimestampDesc(String userEmail);

    List<AuditLog> findAllByOrderByTimestampDesc();

    // Becomes a single SELECT COUNT(*) ... WHERE action IN (...) in the database.
    long countByActionIn(Collection<String> actions);
}