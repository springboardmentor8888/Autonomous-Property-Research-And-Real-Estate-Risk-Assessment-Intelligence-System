package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.backend.Entity.ActivityLog;
import com.realestate.backend.Service.ActivityLogService;

@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    @PostMapping
    public ActivityLog createActivityLog(
            @RequestParam Long userId,
            @RequestParam String action,
            @RequestParam String description) {

        return activityLogService.createActivityLog(
                userId, action, description);
    }

    @GetMapping
    public List<ActivityLog> getAllActivityLogs() {
        return activityLogService.getAllActivityLogs();
    }

    @GetMapping("/user/{userId}")
    public List<ActivityLog> getActivityLogsByUserId(
            @PathVariable Long userId) {

        return activityLogService.getActivityLogsByUserId(userId);
    }

    @GetMapping("/{id}")
    public ActivityLog getActivityLogById(
            @PathVariable Long id) {

        return activityLogService.getActivityLogById(id);
    }
    @GetMapping("/user-activity/{userId}")
    public List<ActivityLog> getUserActivity(
            @PathVariable Long userId) {

        return activityLogService.getActivityLogsByUserId(userId);
    }
}