package com.realestate.backend.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.ActivityLog;
import com.realestate.backend.Exception.ActivityLogNotFoundException;
import com.realestate.backend.Repository.ActivityLogRepository;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public ActivityLog createActivityLog(
            Long userId,
            String action,
            String description) {

        ActivityLog activityLog = new ActivityLog();

        activityLog.setUserId(userId);
        activityLog.setAction(action);
        activityLog.setDescription(description);
        activityLog.setTimestamp(LocalDateTime.now());

        return activityLogRepository.save(activityLog);
    }

    public List<ActivityLog> getAllActivityLogs() {
        return activityLogRepository.findAll();
    }

    public List<ActivityLog> getActivityLogsByUserId(Long userId) {
        return activityLogRepository.findByUserId(userId);
    }

    public ActivityLog getActivityLogById(Long id) {
        return activityLogRepository.findById(id)
                .orElseThrow(() ->
                        new ActivityLogNotFoundException(
                                "Activity log not found with id: " + id));
    }
}