package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.entities.BuildingPermitDetails;
import com.duedilligenceagent.backend.entities.ComparablePropertyDetails;
import com.duedilligenceagent.backend.entities.DueDiligenceReport;
import com.duedilligenceagent.backend.entities.EnvironmentalDetails;
import com.duedilligenceagent.backend.entities.FloodZoneDetails;
import com.duedilligenceagent.backend.entities.Notification;
import com.duedilligenceagent.backend.entities.OwnershipDetails;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.entities.TaxDetails;
import com.duedilligenceagent.backend.entities.ZoningDetails;
import com.duedilligenceagent.backend.repositories.BuildingPermitDetailsRepository;
import com.duedilligenceagent.backend.repositories.ComparablePropertyDetailsRepository;
import com.duedilligenceagent.backend.repositories.DueDiligenceReportRepository;
import com.duedilligenceagent.backend.repositories.EnvironmentalDetailsRepository;
import com.duedilligenceagent.backend.repositories.FloodZoneDetailsRepository;
import com.duedilligenceagent.backend.repositories.NotificationRepository;
import com.duedilligenceagent.backend.repositories.OwnershipDetailsRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.RiskAssessmentDetailsRepository;
import com.duedilligenceagent.backend.repositories.TaxDetailsRepository;
import com.duedilligenceagent.backend.repositories.UserRepository;
import com.duedilligenceagent.backend.repositories.ZoningDetailsRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DueDiligenceService {

    private final PropertyRepository propertyRepository;
    private final RiskAssessmentDetailsRepository riskRepository;
    private final ComparablePropertyDetailsRepository comparableRepository;
    private final DueDiligenceReportRepository reportRepository;
    private final NotificationRepository notificationRepository;
    private final OwnershipDetailsRepository ownershipRepository;
    private final TaxDetailsRepository taxRepository;
    private final FloodZoneDetailsRepository floodRepository;
    private final BuildingPermitDetailsRepository permitRepository;
    private final ZoningDetailsRepository zoningRepository;
    private final EnvironmentalDetailsRepository environmentalRepository;
    private final UserRepository userRepository;

    @Transactional
    public Map<String, Object> assessRisk(Long propertyId) {
        Property property = property(propertyId);
        RiskAssessmentDetails risk = riskRepository.save(buildRisk(propertyId));
        return riskResponse(property, risk);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRisk(Long propertyId) {
        Property property = property(propertyId);
        RiskAssessmentDetails risk = riskRepository.findTopByPropertyIdOrderByAssessedAtDesc(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("No risk assessment exists for property: " + propertyId));
        return riskResponseWithoutSave(property, risk);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> compareProperties(Long propertyId) {
        Property property = property(propertyId);
        List<ComparablePropertyDetails> comparables = comparableRepository.findByPropertyIdOrderByPricePerSqftAsc(propertyId);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("property", propertySummary(property));
        response.put("count", comparables.size());
        response.put("comparables", comparables.stream().map(this::comparableResponse).toList());
        response.put("valuation", valuationResponse(comparables));
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> valuation(Long propertyId) {
        property(propertyId);
        return valuationResponse(comparableRepository.findByPropertyIdOrderByPricePerSqftAsc(propertyId));
    }

    @Transactional
    public Map<String, Object> generateReport(Long propertyId, Authentication authentication) {
        Property property = property(propertyId);
        Long userId = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"))
                .getUserId();
        RiskAssessmentDetails risk = riskRepository.findTopByPropertyIdOrderByAssessedAtDesc(propertyId)
                .orElseGet(() -> riskRepository.save(buildRisk(propertyId)));
        if (risk.getOverallScore() == null) {
            risk.setOverallScore(calculateOverall(risk));
            risk = riskRepository.save(risk);
        }
        Map<String, Object> riskMap = riskResponse(property, risk);
        String summary = summary(property, risk);
        DueDiligenceReport report = reportRepository.save(DueDiligenceReport.builder()
                .propertyId(propertyId)
                .generatedBy(userId)
                .riskAssessmentId(risk.getRiskAssessmentId())
                .executiveSummary(summary)
                .status("COMPLETED")
                .build());
        notificationRepository.save(Notification.builder()
                .userId(userId)
                .propertyId(propertyId)
                .reportId(report.getReportId())
                .notificationType("REPORT_READY")
                .message("Due diligence report is ready for " + property.getAddress())
                .status("UNREAD")
                .sentAt(LocalDateTime.now())
                .build());
        return reportResponse(report, property, riskMap);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReport(Long reportId) {
        DueDiligenceReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with id: " + reportId));
        Property property = property(report.getPropertyId());
        RiskAssessmentDetails risk = riskRepository.findById(report.getRiskAssessmentId())
                .orElseThrow(() -> new IllegalArgumentException("Risk assessment not found"));
        return reportResponse(report, property, riskResponse(property, risk));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> notifications(Authentication authentication) {
        Long userId = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"))
                .getUserId();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(item -> {
            Map<String, Object> notification = new LinkedHashMap<>();
            notification.put("notificationId", item.getNotificationId());
            notification.put("reportId", item.getReportId());
            notification.put("propertyId", item.getPropertyId());
            notification.put("type", item.getNotificationType());
            notification.put("message", item.getMessage());
            notification.put("status", item.getStatus());
            notification.put("createdAt", item.getCreatedAt());
            notification.put("sentAt", item.getSentAt());
            return notification;
        }).toList();
    }

    @Transactional(readOnly = true)
    public byte[] export(Long reportId, String format) {
        Map<String, Object> report = getReport(reportId);
        if ("xlsx".equalsIgnoreCase(format) || "excel".equalsIgnoreCase(format)) {
            return excel(report);
        }
        if ("pdf".equalsIgnoreCase(format)) {
            return pdf(report);
        }
        throw new IllegalArgumentException("Unsupported export format: " + format);
    }

    private RiskAssessmentDetails buildRisk(Long propertyId) {
        List<TaxDetails> taxes = taxRepository.findByPropertyId(propertyId);
        List<FloodZoneDetails> floods = floodRepository.findByPropertyId(propertyId);
        List<BuildingPermitDetails> permits = permitRepository.findByPropertyId(propertyId);
        List<ZoningDetails> zoning = zoningRepository.findByPropertyId(propertyId);
        List<EnvironmentalDetails> environmental = environmentalRepository.findByPropertyId(propertyId);
        List<OwnershipDetails> ownership = ownershipRepository.findByPropertyId(propertyId);
        return RiskAssessmentDetails.builder()
                .propertyId(propertyId)
                .taxRisk(scoreTax(taxes))
                .legalRisk(scoreEnvironmental(environmental))
                .floodRisk(scoreFlood(floods))
                .permitCompliance(scorePermits(permits))
                .zoningCompliance(scoreZoning(zoning))
                .ownershipVerification(ownership.isEmpty() ? BigDecimal.valueOf(60) : BigDecimal.valueOf(10))
                .assessedAt(LocalDateTime.now())
                .build();
    }

    private Map<String, Object> riskResponse(Property property, RiskAssessmentDetails risk) {
        BigDecimal overall = List.of(risk.getTaxRisk(), risk.getLegalRisk(), risk.getFloodRisk(),
                        risk.getPermitCompliance(), risk.getZoningCompliance(), risk.getOwnershipVerification())
                .stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(6), 2, RoundingMode.HALF_UP);
        risk.setOverallScore(overall);
        riskRepository.save(risk);
        return riskResponseWithoutSave(property, risk);
    }

    private Map<String, Object> riskResponseWithoutSave(Property property, RiskAssessmentDetails risk) {
        BigDecimal overall = risk.getOverallScore() != null
            ? risk.getOverallScore() : calculateOverall(risk);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("property", propertySummary(property));
        response.put("assessmentId", risk.getRiskAssessmentId());
        response.put("assessedAt", risk.getAssessedAt());
        response.put("overallRiskScore", overall);
        response.put("riskLevel", riskLevel(overall));
        response.put("factors", Map.of("taxRisk", risk.getTaxRisk(), "legalRisk", risk.getLegalRisk(),
                "floodRisk", risk.getFloodRisk(), "permitComplianceRisk", risk.getPermitCompliance(),
                "zoningComplianceRisk", risk.getZoningCompliance(),
                "ownershipVerificationRisk", risk.getOwnershipVerification()));
        return response;
    }

    private BigDecimal calculateOverall(RiskAssessmentDetails risk) {
        return List.of(risk.getTaxRisk(), risk.getLegalRisk(), risk.getFloodRisk(),
                        risk.getPermitCompliance(), risk.getZoningCompliance(), risk.getOwnershipVerification())
                .stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(6), 2, RoundingMode.HALF_UP);
    }

    private Map<String, Object> valuationResponse(List<ComparablePropertyDetails> comparables) {
        List<BigDecimal> prices = comparables.stream().map(ComparablePropertyDetails::getPricePerSqft)
                .filter(value -> value != null).sorted().toList();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("sampleSize", prices.size());
        if (prices.isEmpty()) {
            result.put("averagePricePerSqft", null);
            result.put("medianPricePerSqft", null);
            result.put("lowPricePerSqft", null);
            result.put("highPricePerSqft", null);
            return result;
        }
        BigDecimal total = prices.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        result.put("averagePricePerSqft", total.divide(BigDecimal.valueOf(prices.size()), 2, RoundingMode.HALF_UP));
        result.put("medianPricePerSqft", prices.get((prices.size() - 1) / 2)
                .add(prices.get(prices.size() / 2)).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP));
        result.put("lowPricePerSqft", prices.get(0));
        result.put("highPricePerSqft", prices.get(prices.size() - 1));
        return result;
    }

    private Map<String, Object> reportResponse(DueDiligenceReport report, Property property, Map<String, Object> risk) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("reportId", report.getReportId());
        response.put("status", report.getStatus());
        response.put("generatedAt", report.getGeneratedAt());
        response.put("updatedAt", report.getUpdatedAt());
        response.put("executiveSummary", report.getExecutiveSummary());
        response.put("property", propertySummary(property));
        response.put("riskAssessment", risk);
        response.put("valuation", valuationResponse(comparableRepository.findByPropertyIdOrderByPricePerSqftAsc(property.getPropertyId())));
        return response;
    }

    private Map<String, Object> comparableResponse(ComparablePropertyDetails item) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", item.getComparableId());
        response.put("listingId", item.getExternalListingId());
        response.put("city", item.getCity());
        response.put("locality", item.getLocality());
        response.put("propertyType", item.getPropertyType());
        response.put("areaSqft", item.getAreaSqft());
        response.put("price", item.getPrice());
        response.put("pricePerSqft", item.getPricePerSqft());
        response.put("verified", item.getVerified());
        response.put("source", item.getSource());
        return response;
    }

    private Map<String, Object> propertySummary(Property property) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("propertyId", property.getPropertyId());
        result.put("address", property.getAddress());
        result.put("city", property.getCity());
        result.put("state", property.getState());
        result.put("postalCode", property.getPostalCode());
        result.put("propertyType", property.getPropertyType());
        return result;
    }

    private String summary(Property property, RiskAssessmentDetails risk) {
        return "Due diligence completed for " + property.getAddress() + ". Overall risk score: "
                + risk.getOverallScore() + " (" + riskLevel(risk.getOverallScore()) + ").";
    }

    private Property property(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found with id: " + id));
    }

    private BigDecimal scoreTax(List<TaxDetails> records) {
        return records.stream().anyMatch(item -> item.getTaxDue() != null && item.getTaxDue().signum() > 0)
                ? BigDecimal.valueOf(80) : records.isEmpty() ? BigDecimal.valueOf(50) : BigDecimal.valueOf(10);
    }

    private BigDecimal scoreFlood(List<FloodZoneDetails> records) {
        if (records.isEmpty()) return BigDecimal.valueOf(50);
        String level = records.get(records.size() - 1).getRiskLevel();
        if (level == null) return BigDecimal.valueOf(40);
        return level.toLowerCase().contains("high") ? BigDecimal.valueOf(80)
                : level.toLowerCase().contains("moderate") || level.toLowerCase().contains("medium")
                ? BigDecimal.valueOf(50) : BigDecimal.valueOf(10);
    }

    private BigDecimal scorePermits(List<BuildingPermitDetails> records) {
        if (records.isEmpty()) return BigDecimal.valueOf(40);
        return records.stream().anyMatch(item -> item.getPermitStatus() != null
                && !item.getPermitStatus().toLowerCase().contains("complete")
                && !item.getPermitStatus().toLowerCase().contains("closed"))
                ? BigDecimal.valueOf(65) : BigDecimal.valueOf(10);
    }

    private BigDecimal scoreZoning(List<ZoningDetails> records) {
        if (records.isEmpty()) return BigDecimal.valueOf(45);
        return records.stream().anyMatch(item -> item.getZoningStatus() != null
                && (item.getZoningStatus().toLowerCase().contains("non")
                || item.getZoningStatus().toLowerCase().contains("violation")))
                ? BigDecimal.valueOf(70) : BigDecimal.valueOf(10);
    }

    private BigDecimal scoreEnvironmental(List<EnvironmentalDetails> records) {
        if (records.isEmpty()) return BigDecimal.valueOf(25);
        return records.stream().anyMatch(item -> item.getRiskLevel() != null
                && item.getRiskLevel().toLowerCase().contains("high"))
                ? BigDecimal.valueOf(75) : BigDecimal.valueOf(20);
    }

    private String riskLevel(BigDecimal score) {
        return score.compareTo(BigDecimal.valueOf(67)) >= 0 ? "HIGH"
                : score.compareTo(BigDecimal.valueOf(34)) >= 0 ? "MEDIUM" : "LOW";
    }

    private byte[] excel(Map<String, Object> report) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Due Diligence Report");
            int rowNumber = 0;
            rowNumber = row(sheet, rowNumber, "Report ID", report.get("reportId"));
            rowNumber = row(sheet, rowNumber, "Status", report.get("status"));
            rowNumber = row(sheet, rowNumber, "Executive Summary", report.get("executiveSummary"));
            Map<?, ?> property = (Map<?, ?>) report.get("property");
            rowNumber = row(sheet, rowNumber, "Address", property.get("address"));
            rowNumber = row(sheet, rowNumber, "City", property.get("city"));
            Map<?, ?> risk = (Map<?, ?>) report.get("riskAssessment");
            rowNumber = row(sheet, rowNumber, "Overall Risk Score", risk.get("overallRiskScore"));
            rowNumber = row(sheet, rowNumber, "Risk Level", risk.get("riskLevel"));
            Map<?, ?> valuation = (Map<?, ?>) report.get("valuation");
            row(sheet, rowNumber, "Comparable Average Price/SqFt", valuation.get("averagePricePerSqft"));
            workbook.write(output);
            return output.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create Excel report", ex);
        }
    }

    private int row(Sheet sheet, int rowNumber, String label, Object value) {
        Row row = sheet.createRow(rowNumber);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value == null ? "" : String.valueOf(value));
        return rowNumber + 1;
    }

    private byte[] pdf(Map<String, Object> report) {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            document.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 16);
                content.newLineAtOffset(50, 740);
                content.showText("Real Estate Due Diligence Report");
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                content.newLineAtOffset(0, -30);
                content.showText("Report ID: " + report.get("reportId"));
                content.newLineAtOffset(0, -18);
                content.showText("Status: " + report.get("status"));
                content.newLineAtOffset(0, -18);
                content.showText("Summary: " + truncate(String.valueOf(report.get("executiveSummary")), 110));
                Map<?, ?> risk = (Map<?, ?>) report.get("riskAssessment");
                content.newLineAtOffset(0, -30);
                content.showText("Overall risk: " + risk.get("overallRiskScore") + " (" + risk.get("riskLevel") + ")");
                Map<?, ?> valuation = (Map<?, ?>) report.get("valuation");
                content.newLineAtOffset(0, -18);
                content.showText("Comparable average price per sqft: " + valuation.get("averagePricePerSqft"));
                content.endText();
            }
            document.save(output);
            return output.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create PDF report", ex);
        }
    }

    private String truncate(String text, int maxLength) {
        return text.length() <= maxLength ? text : text.substring(0, maxLength - 3) + "...";
    }
}
