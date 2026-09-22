package com.realestate.backend.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.ReportHistory;
import com.realestate.backend.Exception.ReportHistoryNotFoundException;
import com.realestate.backend.Repository.ReportHistoryRepository;

@Service
public class ReportHistoryService {

    @Autowired
    private ReportHistoryRepository reportHistoryRepository;

    public ReportHistory createReportHistory(
            Long propertyId,
            Long userId,
            String reportType,
            String fileFormat,
            String status) {

        ReportHistory reportHistory = new ReportHistory();

        reportHistory.setPropertyId(propertyId);
        reportHistory.setUserId(userId);
        reportHistory.setReportType(reportType);
        reportHistory.setFileFormat(fileFormat);
        reportHistory.setGeneratedAt(LocalDateTime.now());
        reportHistory.setStatus(status);

        return reportHistoryRepository.save(reportHistory);
    }

    public List<ReportHistory> getAllReportHistory() {
        return reportHistoryRepository.findAll();
    }

    public List<ReportHistory> getReportHistoryByPropertyId(Long propertyId) {
        return reportHistoryRepository.findByPropertyId(propertyId);
    }

    public List<ReportHistory> getReportHistoryByUserId(Long userId) {
        return reportHistoryRepository.findByUserId(userId);
    }

    public ReportHistory getReportHistoryById(Long id) {
        return reportHistoryRepository.findById(id)
                .orElseThrow(() ->
                        new ReportHistoryNotFoundException(
                                "Report history not found with id: " + id));
    }
}
