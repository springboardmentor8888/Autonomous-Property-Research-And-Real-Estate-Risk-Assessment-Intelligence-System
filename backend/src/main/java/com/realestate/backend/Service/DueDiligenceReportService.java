package com.realestate.backend.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.DueDiligence;
import com.realestate.backend.Entity.DueDiligenceReport;
import com.realestate.backend.Entity.Property;
import com.realestate.backend.Entity.PropertyHistory;
import com.realestate.backend.Entity.RiskAssessment;

@Service
public class DueDiligenceReportService {

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private RiskAssessmentService riskAssessmentService;
    @Autowired
    private PropertyHistoryService propertyHistoryService;
    @Autowired
    private DueDiligenceService dueDiligenceService;
    public DueDiligenceReport generateReport(Long propertyId) {

        Property property = propertyService.getPropertyById(propertyId);

        RiskAssessment riskAssessment =
                riskAssessmentService.getRiskAssessmentByPropertyId(propertyId);

        DueDiligenceReport report = new DueDiligenceReport();

        report.setPropertyId(property.getId());
        report.setPropertyAddress(property.getAddress());

        report.setRiskScore(riskAssessment.getRiskScore());
        report.setOverallRisk(riskAssessment.getOverallRisk());

        report.setExecutiveSummary(
                "Due diligence report generated for property at "
                + property.getAddress()
                + ". Overall risk level: "
                + riskAssessment.getOverallRisk()
                + "."
        );
        report.setPropertyTimeline(buildPropertyTimeline(propertyId));
        report.setSupportingDocuments(buildSupportingDocuments(propertyId));
        report.setGeneratedAt(java.time.LocalDateTime.now());

        return report;
    }
    private String buildPropertyTimeline(Long propertyId) {

        List<PropertyHistory> historyList =
                propertyHistoryService.getHistoryByPropertyId(propertyId);

        if (historyList.isEmpty()) {
            return "No property history available.";
        }

        StringBuilder timeline = new StringBuilder();

        for (PropertyHistory history : historyList) {

            timeline.append("Date: ")
                    .append(history.getEventDate())
                    .append(" | Event: ")
                    .append(history.getEventType())
                    .append(" | Description: ")
                    .append(history.getDescription())
                    .append("\n");
        }

        return timeline.toString();
    }
    private String buildSupportingDocuments(Long propertyId) {

        DueDiligence dueDiligence =
                dueDiligenceService.getDueDiligenceByPropertyId(propertyId);

        if (dueDiligence == null) {
            return "No supporting documents available.";
        }

        if (dueDiligence.getSummary() == null
                || dueDiligence.getSummary().isBlank()) {

            return "Due Diligence Status: "
                    + dueDiligence.getStatus();
        }

        return "Due Diligence Status: "
                + dueDiligence.getStatus()
                + " | Summary: "
                + dueDiligence.getSummary();
    }

}