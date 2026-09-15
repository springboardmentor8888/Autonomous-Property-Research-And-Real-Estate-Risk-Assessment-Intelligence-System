package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserId(Long userId);
    List<AuditLog> findAllByOrderByTimestampDesc();
}
