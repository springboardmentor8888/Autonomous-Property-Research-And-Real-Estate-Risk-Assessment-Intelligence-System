package com.realestate.backend.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.ApiLog;
import com.realestate.backend.Exception.ApiLogNotFoundException;
import com.realestate.backend.Repository.ApiLogRepository;

@Service
public class ApiLogService {

    @Autowired
    private ApiLogRepository apiLogRepository;

    public ApiLog createApiLog(
            String method,
            String endpoint,
            Integer statusCode,
            Long userId) {

        ApiLog apiLog = new ApiLog();

        apiLog.setMethod(method);
        apiLog.setEndpoint(endpoint);
        apiLog.setStatusCode(statusCode);
        apiLog.setTimestamp(LocalDateTime.now());
        apiLog.setUserId(userId);

        return apiLogRepository.save(apiLog);
    }

    public List<ApiLog> getAllApiLogs() {
        return apiLogRepository.findAll();
    }

    public List<ApiLog> getApiLogsByUserId(Long userId) {
        return apiLogRepository.findByUserId(userId);
    }

    public ApiLog getApiLogById(Long id) {
        return apiLogRepository.findById(id)
                .orElseThrow(() ->
                        new ApiLogNotFoundException(
                                "API log not found with id: " + id));
    }
}