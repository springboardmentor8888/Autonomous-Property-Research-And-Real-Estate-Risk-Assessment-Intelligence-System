package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.backend.Entity.ReportHistory;
import com.realestate.backend.Service.ReportHistoryService;

@RestController
@RequestMapping("/api/report-history")
public class ReportHistoryController {

    @Autowired
    private ReportHistoryService reportHistoryService;

    @PostMapping
    public ReportHistory createReportHistory(
            @RequestParam Long propertyId,
            @RequestParam Long userId,
            @RequestParam String reportType,
            @RequestParam String fileFormat,
            @RequestParam String status) {

        return reportHistoryService.createReportHistory(
                propertyId,
                userId,
                reportType,
                fileFormat,
                status);
    }

    @GetMapping
    public List<ReportHistory> getAllReportHistory() {
        return reportHistoryService.getAllReportHistory();
    }

    @GetMapping("/property/{propertyId}")
    public List<ReportHistory> getReportHistoryByPropertyId(
            @PathVariable Long propertyId) {

        return reportHistoryService
                .getReportHistoryByPropertyId(propertyId);
    }

    @GetMapping("/user/{userId}")
    public List<ReportHistory> getReportHistoryByUserId(
            @PathVariable Long userId) {

        return reportHistoryService
                .getReportHistoryByUserId(userId);
    }

    @GetMapping("/{id}")
    public ReportHistory getReportHistoryById(
            @PathVariable Long id) {

        return reportHistoryService.getReportHistoryById(id);
    }
}