package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.ApiLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ApiLogRepository extends JpaRepository<ApiLog, Long> {

    Page<ApiLog> findByOrderByRequestTimeDesc(Pageable pageable);

    Page<ApiLog> findBySuccessOrderByRequestTimeDesc(boolean success, Pageable pageable);

    @Query("SELECT a.serviceName, COUNT(a), "
            + "SUM(CASE WHEN a.success = true THEN 1 ELSE 0 END) "
            + "FROM ApiLog a "
            + "WHERE a.requestTime >= :since "
            + "GROUP BY a.serviceName")
    List<Object[]> statsByService(@Param("since") LocalDateTime since);

    long countByRequestTimeAfter(LocalDateTime since);

    /** Logged calls within a window — the admin analytics API stats. */
    List<ApiLog> findByRequestTimeAfter(LocalDateTime since);
}
