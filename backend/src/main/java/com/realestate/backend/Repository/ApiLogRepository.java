package com.realestate.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.backend.Entity.ApiLog;

public interface ApiLogRepository extends JpaRepository<ApiLog, Long> {

    List<ApiLog> findByUserId(Long userId);
}