package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.DiligenceDataResponse;
import com.duedilligenceagent.backend.dto.AggregationResponse;
import com.duedilligenceagent.backend.dto.MarketAnalysisResponse;
import com.duedilligenceagent.backend.dto.ReportResponse;
import com.duedilligenceagent.backend.dto.RiskAssessmentResponse;
import com.duedilligenceagent.backend.entities.DueDiligenceReport;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.AggregationRunRepository;
import com.duedilligenceagent.backend.repositories.DueDiligenceReportRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.RiskAssessmentDetailsRepository;
import com.duedilligenceagent.backend.repositories.SupportingDocsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

/**
 * <b>Stage 3 of the diligence workflow</b>: assembles the final report from
 * the outputs of the earlier stages. The risk assessment comes from the
 * latest stored row (created by the risk-assessment stage; run on demand
 * when absent so the API stays robust), the aggregation-run link records
 * the pipeline provenance, and the executive summary folds in the market
 * positioning when comparables are stored.
 * <p>
 * Reports are user-facing: the response carries the summary, the risk
 * scores, the record statuses and the data coverage — never provider
 * names, contract statuses or pipeline internals.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final PropertyRepository propertyRepository;
    private final DueDiligenceReportRepository reportRepository;
    private final RiskAssessmentDetailsRepository riskAssessmentRepository;
    private final SupportingDocsRepository supportingDocsRepository;
    private final RiskAssessmentService riskAssessmentService;
    private final DiligenceService diligenceService;
    private final AggregationRunRepository aggregationRunRepository;
    private final MarketAnalysisService marketAnalysisService;
    private final NotificationService notificationService;

    /**
     * Stage 3: report generation from the stage outputs. Uses the latest
     * stored risk assessment (running the risk stage first when none
     * exists) and links the latest aggregation run for provenance.
     */
    @Transactional
    public ReportResponse generate(Long propertyId, Long generatedByUserId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Property not found with id: " + propertyId));

        // Stage-1 output: the latest stored risk assessment (run on demand
        // when the stage was never executed — keeps the API robust).
        RiskAssessmentDetails assessment =
                riskAssessmentRepository.findFirstByPropertyIdOrderByAssessedAtDesc(propertyId)
                        .orElseGet(() -> riskAssessmentService.calculateAndPersist(property));

        DiligenceDataResponse diligence = diligenceService.getDiligenceData(propertyId);

        // Stage-2 output: market positioning folded into the summary.
            MarketAnalysisResponse marketAnalysis = marketAnalysisService.analyze(propertyId);

        String summary = buildExecutiveSummary(property, assessment, diligence, marketAnalysis);

        DueDiligenceReport report = reportRepository.save(DueDiligenceReport.builder()
                .propertyId(propertyId)
                .generatedBy(generatedByUserId)
                .riskAssessmentId(assessment.getRiskAssessmentId())
                .aggregationRunId(latestRunId(propertyId))
                .executiveSummary(summary)
                .status("COMPLETED")
                .build());

        log.info("Generated due-diligence report id={} for property id={} by user id={} (risk assessment id={})",
                report.getReportId(), propertyId, generatedByUserId, assessment.getRiskAssessmentId());

        // SRS 1.11: notify the user that their report is ready (in-app + email).
        try {
            notificationService.notify(generatedByUserId, NotificationService.TYPE_REPORT_READY,
                    "Your due-diligence report for " + property.getAddress()
                            + " is ready. Overall risk: "
                            + (assessment.getOverallScore() == null ? "insufficient data"
                                    : assessment.getOverallScore().stripTrailingZeros().toPlainString() + "/100"),
                    propertyId, report.getReportId());
        } catch (Exception ex) {
            log.warn("Report-ready notification failed for report id={}: {}",
                    report.getReportId(), ex.getMessage());
        }

        return toResponse(report, property, assessment, diligence, marketAnalysis);
    }

    /** Latest aggregation run id for the property, when any run exists. */
    private Long latestRunId(Long propertyId) {
        return aggregationRunRepository.findFirstByPropertyIdOrderByStartedAtDesc(propertyId)
                .map(run -> run.getAggregationRunId())
                .orElse(null);
    }

    /** Latest stored report for a property, or empty when none was generated. */
    @Transactional(readOnly = true)
    public ReportResponse latest(Long propertyId) {
        propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Property not found with id: " + propertyId));

        return reportRepository.findFirstByPropertyIdOrderByGeneratedAtDesc(propertyId)
                .map(this::toResponseWithLinkedData)
                .orElse(null);
    }

    /** All reports generated by a user, newest first (reports page). */
    @Transactional(readOnly = true)
    public List<ReportResponse> listForUser(Long userId) {
        return reportRepository.findByGeneratedByOrderByGeneratedAtDesc(userId).stream()
                .map(this::toResponseWithLinkedData)
                .filter(Objects::nonNull)
                .toList();
    }

    private ReportResponse toResponseWithLinkedData(DueDiligenceReport report) {
        Property property = propertyRepository.findById(report.getPropertyId()).orElse(null);
        if (property == null) {
            return null;
        }
        RiskAssessmentDetails assessment = report.getRiskAssessmentId() == null ? null
                : riskAssessmentRepository.findById(report.getRiskAssessmentId()).orElse(null);
        DiligenceDataResponse diligence = diligenceService.getDiligenceData(report.getPropertyId());
        MarketAnalysisResponse marketAnalysis = marketAnalysisService.analyze(report.getPropertyId());
        return toResponse(report, property, assessment, diligence, marketAnalysis);
    }

    private ReportResponse toResponse(DueDiligenceReport report, Property property,
                                      RiskAssessmentDetails assessment, DiligenceDataResponse diligence,
                                      MarketAnalysisResponse marketAnalysis) {
        String aggregationStatus = report.getAggregationRunId() == null ? null
                : aggregationRunRepository.findById(report.getAggregationRunId())
                        .map(run -> run.getStatus())
                        .orElse(null);
        return ReportResponse.builder()
                .reportId(report.getReportId())
                .propertyId(report.getPropertyId())
                .propertyAddress(property.getAddress())
                .riskTier(assessment == null ? "UNKNOWN" : RiskAssessmentService.tierOf(assessment.getOverallScore()))
                .executiveSummary(report.getExecutiveSummary())
                .propertyInfo(property == null ? null : ReportResponse.PropertyInfo.builder()
                        .propertyType(property.getPropertyType())
                        .locality(property.getLocality())
                        .city(property.getCity())
                        .price(property.getPrice())
                        .reraId(property.getReraId())
                        .build())
                .summaryPoints(summaryPoints(assessment, diligence, marketAnalysis, toCoverage(diligence)))
                .status(report.getStatus())
                .generatedAt(report.getGeneratedAt())
                .aggregationRunId(report.getAggregationRunId())
                .aggregationStatus(aggregationStatus)
                .marketPosition(marketAnalysis == null || marketAnalysis.getPositioning() == null
                        ? null : ReportResponse.MarketPosition.builder()
                                .verdict(marketAnalysis.getPositioning().getVerdict())
                                .deltaPercent(marketAnalysis.getPositioning().getDeltaPercent())
                                .basis(marketAnalysis.getPositioning().getBasis())
                                .build())
                .risk(toRiskResponse(assessment))
                .timeline(timeline(diligence))
                .findings(findings(diligence))
                .verdict(verdict(assessment, diligence, toCoverage(diligence)))
                .documents(supportingDocsRepository.findByPropertyIdOrderByUploadedAtDesc(
                                report.getPropertyId()).stream()
                        .map(doc -> ReportResponse.DocumentInfo.builder()
                                .documentId(doc.getDocumentId())
                                .fileName(doc.getFileName())
                                .fileType(doc.getFileType())
                                .uploadedAt(doc.getUploadedAt())
                                .build())
                        .toList())
                .riskBasis(riskBasis(assessment, diligence))
                .comparables(comparables(diligence))
                .records(toRecordStatuses(diligence))
                .coverage(toCoverage(diligence))
                .build();
    }

    private RiskAssessmentResponse toRiskResponse(RiskAssessmentDetails assessment) {
        if (assessment == null) {
            return null;
        }
        return RiskAssessmentResponse.builder()
                .riskAssessmentId(assessment.getRiskAssessmentId())
                .propertyId(assessment.getPropertyId())
                .taxRisk(assessment.getTaxRisk())
                .legalRisk(assessment.getLegalRisk())
                .floodRisk(assessment.getFloodRisk())
                .permitCompliance(assessment.getPermitCompliance())
                .zoningCompliance(assessment.getZoningCompliance())
                .ownershipVerification(assessment.getOwnershipVerification())
                .overallScore(assessment.getOverallScore())
                .assessedAt(assessment.getAssessedAt())
                .build();
    }

    private ReportResponse.RecordStatuses toRecordStatuses(DiligenceDataResponse diligence) {
        return ReportResponse.RecordStatuses.builder()
                .taxStatus(diligence.getTax() == null ? null : diligence.getTax().getPaymentStatus())
                .permitStatus(diligence.getPermits() == null || diligence.getPermits().isEmpty()
                        ? null : diligence.getPermits().get(0).getPermitStatus())
                .zoningStatus(diligence.getZoning() == null ? null : diligence.getZoning().getZoningStatus())
                .floodRiskLevel(diligence.getFlood() == null ? null : diligence.getFlood().getRiskLevel())
                .environmentalStatus(diligence.getEnvironmental() == null
                        ? null : diligence.getEnvironmental().getStatus())
                .ownershipType(diligence.getOwnership() == null
                        ? null : diligence.getOwnership().getOwnershipType())
                .utilitiesAvailable(diligence.getUtilities() == null ? 0 : (int) diligence.getUtilities().stream()
                        .filter(u -> "AVAILABLE".equalsIgnoreCase(nullSafe(u.getAvailabilityStatus())))
                        .count())
                .build();
    }

    private ReportResponse.DataCoverage toCoverage(DiligenceDataResponse diligence) {
        List<String> missing = new ArrayList<>();
        if (diligence.getOwnership() == null) missing.add("ownership");
        if (diligence.getTax() == null) missing.add("property tax");
        if (diligence.getPermits() == null || diligence.getPermits().isEmpty()) missing.add("building permits");
        if (diligence.getZoning() == null) missing.add("zoning");
        if (diligence.getFlood() == null) missing.add("flood zone");
        if (diligence.getEnvironmental() == null) missing.add("environmental");
        if (diligence.getUtilities() == null || diligence.getUtilities().isEmpty()) missing.add("utilities");
        if (diligence.getComparables() == null || diligence.getComparables().isEmpty()) missing.add("comparable listings");
        if (diligence.getMarketTrends() == null || diligence.getMarketTrends().isEmpty()) missing.add("market trends");

        return ReportResponse.DataCoverage.builder()
                .ownershipRecord(diligence.getOwnership() != null)
                .taxRecord(diligence.getTax() != null)
                .permitRecord(diligence.getPermits() != null && !diligence.getPermits().isEmpty())
                .zoningRecord(diligence.getZoning() != null)
                .floodRecord(diligence.getFlood() != null)
                .environmentalRecord(diligence.getEnvironmental() != null)
                .utilityRecords(diligence.getUtilities() != null && !diligence.getUtilities().isEmpty())
                .comparablesCount(diligence.getComparables() == null ? 0 : diligence.getComparables().size())
                .marketTrendsCount(diligence.getMarketTrends() == null ? 0 : diligence.getMarketTrends().size())
                .missingSections(missing)
                .build();
    }

    /**
     * Builds the executive summary from the actual record statuses in a
     * professional analyst voice: an overall-risk opening sentence,
     * full-clause concerns (domains scoring ≥ 45) or a clean-bill sentence,
     * the ownership position, market context when trends are stored, and a
     * data-completeness closing line.
     */
    private String buildExecutiveSummary(Property property, RiskAssessmentDetails assessment,
                                        DiligenceDataResponse diligence,
                                        MarketAnalysisResponse marketAnalysis) {
        ReportResponse.DataCoverage coverage = toCoverage(diligence);

        // Insufficient data: no diligence records exist — no fabricated scores.
        if (assessment.getOverallScore() == null) {
            return "No due-diligence records are available for this property yet, so a "
                    + "risk assessment could not be performed. The following sections remain "
                    + "unsourced and must be populated before the property can be evaluated: "
                    + String.join(", ", coverage.getMissingSections()) + ".";
        }

        String tier = RiskAssessmentService.tierOf(assessment.getOverallScore());
        String tierPhrase = switch (tier) {
            case "LOW" -> "a low overall risk profile";
            case "MODERATE" -> "a moderate overall risk profile";
            case "ELEVATED" -> "an elevated overall risk profile";
            case "HIGH" -> "a high overall risk profile";
            default -> "an unclassified overall risk profile";
        };
        StringBuilder sb = new StringBuilder("This property presents ")
                .append(tierPhrase)
                .append(" (")
                .append(assessment.getOverallScore().stripTrailingZeros().toPlainString())
                .append("/100). ");

        List<String> concerns = concerns(assessment, diligence);
        if (concerns.isEmpty()) {
            sb.append("No material concerns were identified in the available diligence records. ");
        } else if (concerns.size() == 1) {
            sb.append("The assessment identified one material concern. ")
                    .append(concerns.get(0)).append(". ");
        } else {
            sb.append("The assessment identified material concerns. ")
                    .append(String.join(". ", concerns)).append(". ");
        }

        if (diligence.getOwnership() != null) {
            sb.append("Ownership is recorded as ")
                    .append(humanize(diligence.getOwnership().getOwnershipType()))
                    .append(". ");
        }

        // Stage-2 output: market positioning against the stored comparables.
        if (marketAnalysis != null && marketAnalysis.getPositioning() != null
                && marketAnalysis.getPositioning().getDeltaPercent() != null) {
            BigDecimal delta = marketAnalysis.getPositioning().getDeltaPercent();
            if ("BELOW_MARKET".equals(marketAnalysis.getPositioning().getVerdict())) {
                sb.append("Against the comparable market, the property is priced ")
                        .append(delta.abs().toPlainString()).append("% below average. ");
            } else if ("ABOVE_MARKET".equals(marketAnalysis.getPositioning().getVerdict())) {
                sb.append("Against the comparable market, the property is priced ")
                        .append(delta.toPlainString()).append("% above average. ");
            } else if ("ALIGNED".equals(marketAnalysis.getPositioning().getVerdict())) {
                sb.append("The asking price is in line with the comparable market. ");
            }
        }

        String market = marketContext(diligence);
        if (market != null) {
            sb.append(market).append(' ');
        }

        sb.append(completenessLine(coverage));
        return sb.toString().trim();
    }

    /**
     * Point-wise executive summary for on-screen review: a headline risk
     * bullet, one bullet per material concern, ownership, market
     * positioning and data coverage. Mirrors the paragraph builder so the
     * two never disagree.
     */
    private List<String> summaryPoints(RiskAssessmentDetails assessment,
                                       DiligenceDataResponse diligence,
                                       MarketAnalysisResponse marketAnalysis,
                                       ReportResponse.DataCoverage coverage) {
        List<String> points = new ArrayList<>();

        if (assessment == null || assessment.getOverallScore() == null) {
            points.add("Overall risk profile: could not be assessed — no diligence records on file");
            if (coverage != null && coverage.getMissingSections() != null
                    && !coverage.getMissingSections().isEmpty()) {
                points.add("Unsourced sections: " + String.join(", ", coverage.getMissingSections()));
            }
            return points;
        }

        String tier = RiskAssessmentService.tierOf(assessment.getOverallScore());
        points.add("Overall risk profile: " + tier + " ("
                + assessment.getOverallScore().stripTrailingZeros().toPlainString() + "/100)");

        List<String> concerns = concerns(assessment, diligence);
        if (concerns.isEmpty()) {
            points.add("No material concerns identified in the available diligence records");
        } else {
            points.addAll(concerns);
        }

        if (diligence.getOwnership() != null) {
            points.add("Ownership: " + humanize(diligence.getOwnership().getOwnershipType()));
        }

        if (marketAnalysis != null && marketAnalysis.getPositioning() != null
                && marketAnalysis.getPositioning().getDeltaPercent() != null) {
            BigDecimal delta = marketAnalysis.getPositioning().getDeltaPercent();
            String verdict = marketAnalysis.getPositioning().getVerdict();
            if ("BELOW_MARKET".equals(verdict)) {
                points.add("Market position: priced " + delta.abs().toPlainString() + "% below comparable average");
            } else if ("ABOVE_MARKET".equals(verdict)) {
                points.add("Market position: priced " + delta.toPlainString() + "% above comparable average");
            } else if ("ALIGNED".equals(verdict)) {
                points.add("Market position: in line with the comparable market");
            }
        }

        if (coverage != null) {
            int have = 0;
            if (coverage.isOwnershipRecord()) have++;
            if (coverage.isTaxRecord()) have++;
            if (coverage.isPermitRecord()) have++;
            if (coverage.isZoningRecord()) have++;
            if (coverage.isFloodRecord()) have++;
            if (coverage.isEnvironmentalRecord()) have++;
            if (coverage.isUtilityRecords()) have++;
            int comparables = coverage.getComparablesCount() == null ? 0 : coverage.getComparablesCount();
            points.add("Data coverage: " + have + " of 8 record types"
                    + (comparables > 0 ? " · " + comparables + " comparable listings" : "")
                    + ((coverage.getMissingSections() == null || coverage.getMissingSections().isEmpty())
                        ? " · complete coverage"
                        : " · missing: " + String.join(", ", coverage.getMissingSections())));
        }

        return points;
    }

    /**
     * Property timeline derived from diligence record dates — newest first.
     * PropertyHistory is a record-snapshot table, so events are derived
     * from the dates on the stored diligence records.
     */
    private List<ReportResponse.TimelineEvent> timeline(DiligenceDataResponse diligence) {
        List<ReportResponse.TimelineEvent> events = new ArrayList<>();
        if (diligence.getOwnership() != null && diligence.getOwnership().getRecordDate() != null) {
            events.add(ReportResponse.TimelineEvent.builder()
                    .date(diligence.getOwnership().getRecordDate())
                    .eventType("OWNERSHIP")
                    .description("Ownership recorded as "
                            + humanize(diligence.getOwnership().getOwnershipType())
                            + (diligence.getOwnership().getOwnerName() != null
                                ? " — " + diligence.getOwnership().getOwnerName() : ""))
                    .source(diligence.getOwnership().getSource())
                    .build());
        }
        if (diligence.getTax() != null && diligence.getTax().getTaxPayDate() != null) {
            events.add(ReportResponse.TimelineEvent.builder()
                    .date(diligence.getTax().getTaxPayDate())
                    .eventType("TAX")
                    .description("Property tax payment — "
                            + lowerHuman(diligence.getTax().getPaymentStatus())
                            + (diligence.getTax().getTaxAmount() != null
                                ? " (₹" + diligence.getTax().getTaxAmount().toPlainString() + ")" : ""))
                    .source(diligence.getTax().getSource())
                    .build());
        }
        if (diligence.getPermits() != null) {
            for (DiligenceDataResponse.PermitRecord permit : diligence.getPermits()) {
                if (permit.getIssueDate() != null) {
                    events.add(ReportResponse.TimelineEvent.builder()
                            .date(permit.getIssueDate())
                            .eventType("PERMIT")
                            .description("Building permit "
                                    + (permit.getPermitNumber() != null ? permit.getPermitNumber() + " " : "")
                                    + lowerHuman(permit.getPermitStatus()))
                            .source(permit.getPermitType())
                            .build());
                }
                if (permit.getCompletionDate() != null) {
                    events.add(ReportResponse.TimelineEvent.builder()
                            .date(permit.getCompletionDate())
                            .eventType("PERMIT")
                            .description("Permitted works completed"
                                    + (permit.getPermitNumber() != null
                                        ? " — " + permit.getPermitNumber() : ""))
                            .source(permit.getPermitType())
                            .build());
                }
            }
        }
        if (diligence.getZoning() != null && diligence.getZoning().getEffectiveFrom() != null) {
            events.add(ReportResponse.TimelineEvent.builder()
                    .date(diligence.getZoning().getEffectiveFrom())
                    .eventType("ZONING")
                    .description("Zoning "
                            + (diligence.getZoning().getZoningCode() != null
                                ? diligence.getZoning().getZoningCode() + " " : "")
                            + "effective"
                            + (diligence.getZoning().getAllowedUse() != null
                                ? " — " + diligence.getZoning().getAllowedUse() : ""))
                    .source(null)
                    .build());
        }
        if (diligence.getFlood() != null && diligence.getFlood().getEffectiveDate() != null) {
            events.add(ReportResponse.TimelineEvent.builder()
                    .date(diligence.getFlood().getEffectiveDate())
                    .eventType("FLOOD_ZONE")
                    .description("Flood-zone designation — "
                            + (diligence.getFlood().getZone() != null
                                ? "zone " + zoneName(diligence.getFlood().getZone()) + ", " : "")
                            + lowerHuman(diligence.getFlood().getRiskLevel()) + " risk")
                    .source(null)
                    .build());
        }
        events.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        return events;
    }

    /** Due-diligence findings: status + key detail per sourced diligence area. */
    private List<ReportResponse.Finding> findings(DiligenceDataResponse diligence) {
        List<ReportResponse.Finding> findings = new ArrayList<>();
        if (diligence.getOwnership() != null) {
            findings.add(ReportResponse.Finding.builder()
                    .area("Ownership")
                    .status(diligence.getOwnership().getOwnershipType())
                    .detail(diligence.getOwnership().getOwnerName() != null
                            ? "Owner: " + diligence.getOwnership().getOwnerName()
                            : null)
                    .build());
        }
        if (diligence.getTax() != null) {
            findings.add(ReportResponse.Finding.builder()
                    .area("Property Tax")
                    .status(diligence.getTax().getPaymentStatus())
                    .detail(taxDetail(diligence.getTax()))
                    .build());
        }
        if (diligence.getPermits() != null && !diligence.getPermits().isEmpty()) {
            DiligenceDataResponse.PermitRecord latest = diligence.getPermits().get(0);
            findings.add(ReportResponse.Finding.builder()
                    .area("Building Permits")
                    .status(latest.getPermitStatus())
                    .detail((latest.getPermitNumber() != null ? "Permit " + latest.getPermitNumber() : "")
                            + (latest.getPermitType() != null
                                ? (latest.getPermitNumber() != null ? " · " : "") + latest.getPermitType()
                                : ""))
                    .build());
        }
        if (diligence.getZoning() != null) {
            findings.add(ReportResponse.Finding.builder()
                    .area("Zoning")
                    .status(diligence.getZoning().getZoningStatus())
                    .detail((diligence.getZoning().getZoningCode() != null
                                ? "Code " + diligence.getZoning().getZoningCode() : "")
                            + (diligence.getZoning().getAllowedUse() != null
                                ? (diligence.getZoning().getZoningCode() != null ? " · " : "")
                                    + "Allowed: " + diligence.getZoning().getAllowedUse()
                                : ""))
                    .build());
        }
        if (diligence.getFlood() != null) {
            findings.add(ReportResponse.Finding.builder()
                    .area("Flood")
                    .status(diligence.getFlood().getRiskLevel())
                    .detail(diligence.getFlood().getZone() != null
                            ? "Zone " + zoneName(diligence.getFlood().getZone()) : null)
                    .build());
        }
        if (diligence.getEnvironmental() != null) {
            findings.add(ReportResponse.Finding.builder()
                    .area("Environmental")
                    .status(diligence.getEnvironmental().getStatus())
                    .detail(diligence.getEnvironmental().getDescription())
                    .build());
        }
        if (diligence.getUtilities() != null && !diligence.getUtilities().isEmpty()) {
            String summary = diligence.getUtilities().stream()
                    .map(u -> (u.getUtilityType() != null ? u.getUtilityType() : "Utility")
                            + (u.getAvailabilityStatus() != null
                                ? " (" + lowerHuman(u.getAvailabilityStatus()) + ")" : ""))
                    .reduce((a, b) -> a + ", " + b)
                    .orElse(null);
            findings.add(ReportResponse.Finding.builder()
                    .area("Utilities")
                    .status(diligence.getUtilities().size() + " on record")
                    .detail(summary)
                    .build());
        }
        return findings;
    }

    /**
     * One-line tax detail: a single figure when the amount and the due
     * balance match (no "Amount ₹X · Due ₹X" duplication), both figures
     * only when they genuinely differ.
     */
    private String taxDetail(DiligenceDataResponse.TaxRecord tax) {
        BigDecimal amount = tax.getTaxAmount();
        BigDecimal due = tax.getTaxDue();
        if (amount != null && due != null) {
            if (amount.compareTo(due) == 0) {
                return "₹" + amount.toPlainString() + " due";
            }
            return "Amount ₹" + amount.toPlainString()
                    + " · Due ₹" + due.toPlainString();
        }
        if (amount != null) {
            return "Amount ₹" + amount.toPlainString();
        }
        if (due != null) {
            return "Due ₹" + due.toPlainString();
        }
        return null;
    }

    /** Final due-diligence assessment: per-tier verdict, concerns, actions. */
    private ReportResponse.Verdict verdict(RiskAssessmentDetails assessment,
                                           DiligenceDataResponse diligence,
                                           ReportResponse.DataCoverage coverage) {
        if (assessment == null || assessment.getOverallScore() == null) {
            return ReportResponse.Verdict.builder()
                    .headline("Assessment not possible — no diligence records on file")
                    .majorConcerns(List.of())
                    .followUpActions(coverage != null && coverage.getMissingSections() != null
                            ? List.of("Source the missing sections before evaluating this property: "
                                + String.join(", ", coverage.getMissingSections()))
                            : List.of())
                    .build();
        }

        String tier = RiskAssessmentService.tierOf(assessment.getOverallScore());
        String headline = switch (tier) {
            case "LOW" -> "Favorable for purchase — no material concerns identified";
            case "MODERATE" -> "Generally favorable for purchase — verify the flagged items before closing";
            case "ELEVATED" -> "Proceed with caution — resolve the identified concerns before purchase";
            case "HIGH" -> "High risk — proceed only after resolving the material concerns";
            default -> "Unclassified risk — further verification required";
        };

        List<String> majorConcerns = concerns(assessment, diligence);

        List<String> followUpActions = new ArrayList<>();
        if (score(assessment.getTaxRisk()) >= 45) {
            followUpActions.add("Obtain an up-to-date tax clearance and settle any outstanding dues");
        }
        if (score(assessment.getFloodRisk()) >= 45) {
            followUpActions.add("Review flood-zone insurance requirements and mitigation measures");
        }
        if (score(assessment.getPermitCompliance()) >= 45) {
            followUpActions.add("Follow up on the pending building-permit approval with the local authority");
        }
        if (score(assessment.getZoningCompliance()) >= 45) {
            followUpActions.add("Confirm the zoning status and permitted use with the planning authority");
        }
        if (score(assessment.getLegalRisk()) >= 45) {
            followUpActions.add("Obtain the environmental clearance record for legal review");
        }
        if (score(assessment.getOwnershipVerification()) >= 45) {
            followUpActions.add("Verify the ownership record against the official registry");
        }
        if (coverage != null && coverage.getMissingSections() != null
                && !coverage.getMissingSections().isEmpty()) {
            followUpActions.add("Source the unavailable sections: "
                    + String.join(", ", coverage.getMissingSections()));
        }
        if (followUpActions.isEmpty()) {
            followUpActions.add("No further verification required — records are complete and clear");
        }

        return ReportResponse.Verdict.builder()
                .headline(headline)
                .majorConcerns(majorConcerns)
                .followUpActions(followUpActions)
                .build();
    }

    /** Per-domain risk basis: score, level and a one-line basis. */
    private List<ReportResponse.RiskBasis> riskBasis(RiskAssessmentDetails assessment,
                                                     DiligenceDataResponse diligence) {
        if (assessment == null) {
            return List.of();
        }
        List<ReportResponse.RiskBasis> rows = new ArrayList<>();
        rows.add(basisRow("Overall", assessment.getOverallScore()));
        rows.add(basisRow("Legal / Environmental", assessment.getLegalRisk(),
                diligence.getEnvironmental() == null ? null
                        : "Environmental review " + lowerHuman(diligence.getEnvironmental().getStatus())));
        rows.add(basisRow("Property Tax", assessment.getTaxRisk(),
                diligence.getTax() == null ? null
                        : "Payments " + lowerHuman(diligence.getTax().getPaymentStatus())));
        rows.add(basisRow("Flood", assessment.getFloodRisk(),
                diligence.getFlood() == null ? null
                        : (diligence.getFlood().getZone() != null
                            ? "Zone " + zoneName(diligence.getFlood().getZone()) + ", " : "")
                            + lowerHuman(diligence.getFlood().getRiskLevel()) + " risk"));
        rows.add(basisRow("Building Permits", assessment.getPermitCompliance(),
                diligence.getPermits() == null || diligence.getPermits().isEmpty() ? null
                        : "Latest permit " + lowerHuman(diligence.getPermits().get(0).getPermitStatus())));
        rows.add(basisRow("Zoning", assessment.getZoningCompliance(),
                diligence.getZoning() == null ? null
                        : "Zoning " + lowerHuman(diligence.getZoning().getZoningStatus())));
        rows.add(basisRow("Ownership Verification", assessment.getOwnershipVerification(),
                diligence.getOwnership() == null ? null
                        : "Recorded as " + humanize(diligence.getOwnership().getOwnershipType())));
        return rows;
    }

    private ReportResponse.RiskBasis basisRow(String domain, BigDecimal score) {
        return basisRow(domain, score, null);
    }

    private ReportResponse.RiskBasis basisRow(String domain, BigDecimal score, String basis) {
        return ReportResponse.RiskBasis.builder()
                .domain(domain)
                .score(score)
                .level(score == null ? "NO_DATA" : RiskAssessmentService.tierOf(score))
                .basis(basis)
                .build();
    }

    /**
     * Key comparable listings for the report's market-analysis section —
     * the compact dataset the PDF renders as a table. Computed on read so
     * previously generated reports also carry it.
     */
    private List<ReportResponse.ComparableListing> comparables(DiligenceDataResponse diligence) {
        if (diligence.getComparables() == null || diligence.getComparables().isEmpty()) {
            return List.of();
        }
        return diligence.getComparables().stream()
                .map(c -> ReportResponse.ComparableListing.builder()
                        .listingId(c.getListingId())
                        .locality(c.getLocality())
                        .propertyType(c.getPropertyType())
                        .bhk(c.getBhk())
                        .areaSqft(c.getAreaSqft())
                        .price(c.getPrice())
                        .pricePerSqft(c.getPricePerSqft())
                        .build())
                .toList();
    }

    /**
     * Zone display name with the redundant "ZONE-" prefix stripped, so
     * "Zone " + zone reads as "Zone A" instead of "Zone ZONE-A".
     */
    private String zoneName(String zone) {
        if (zone == null) {
            return null;
        }
        String z = zone.trim();
        String upper = z.toUpperCase();
        for (String prefix : new String[] {"ZONE-", "ZONE:", "ZONE "}) {
            if (upper.startsWith(prefix) && z.length() > prefix.length()) {
                return z.substring(prefix.length());
            }
        }
        return z;
    }

    private List<String> concerns(RiskAssessmentDetails assessment, DiligenceDataResponse diligence) {
        List<String> concerns = new ArrayList<>();
        if (score(assessment.getTaxRisk()) >= 45) {
            String status = diligence.getTax() == null ? null : diligence.getTax().getPaymentStatus();
            concerns.add(status == null
                    ? "Property tax compliance could not be verified because no record is on file"
                    : "Property tax payments are " + lowerHuman(statusOf(status, "pending")));
        }
        if (score(assessment.getFloodRisk()) >= 45) {
            String level = diligence.getFlood() == null ? null : diligence.getFlood().getRiskLevel();
            if (level == null) {
                concerns.add("Flood-zone exposure could not be verified because no record is on file");
            } else if ("UNKNOWN".equalsIgnoreCase(level.trim())) {
                concerns.add("The property's flood-zone risk level is unknown");
            } else {
                concerns.add("The property lies in a " + lowerHuman(level) + "-risk flood zone");
            }
        }
        if (score(assessment.getPermitCompliance()) >= 45) {
            String permitStatus = diligence.getPermits() == null || diligence.getPermits().isEmpty()
                    ? null : diligence.getPermits().get(0).getPermitStatus();
            concerns.add(permitStatus == null
                    ? "Building permits could not be verified because no record is on file"
                    : "On building permits, " + permitPhrase(permitStatus));
        }
        if (score(assessment.getZoningCompliance()) >= 45) {
            String status = diligence.getZoning() == null ? null : diligence.getZoning().getZoningStatus();
            if (status == null) {
                concerns.add("Zoning compliance could not be verified because no record is on file");
            } else {
                concerns.add(switch (statusOf(status, "PENDING").toUpperCase(Locale.ROOT)) {
                    case "PENDING" -> "Zoning compliance is pending review";
                    case "NON_COMPLIANT" -> "The property is non-compliant with zoning regulations";
                    default -> "Zoning compliance is " + lowerHuman(status);
                });
            }
        }
        if (score(assessment.getLegalRisk()) >= 45) {
            String status = diligence.getEnvironmental() == null ? null : diligence.getEnvironmental().getStatus();
            if (status == null) {
                concerns.add("Environmental clearance could not be verified because no record is on file");
            } else {
                concerns.add(switch (statusOf(status, "PENDING").toUpperCase(Locale.ROOT)) {
                    case "NOT_FOUND" -> "No environmental clearance was found on record";
                    default -> "The environmental review is " + lowerHuman(status);
                });
            }
        }
        if (score(assessment.getOwnershipVerification()) >= 45) {
            concerns.add("The ownership record could not be verified");
        }
        return concerns;
    }

    /** One-line data-completeness note derived from the coverage counts. */
    private String completenessLine(ReportResponse.DataCoverage coverage) {
        int have = 0;
        if (coverage.isOwnershipRecord()) have++;
        if (coverage.isTaxRecord()) have++;
        if (coverage.isPermitRecord()) have++;
        if (coverage.isZoningRecord()) have++;
        if (coverage.isFloodRecord()) have++;
        if (coverage.isEnvironmentalRecord()) have++;
        if (coverage.isUtilityRecords()) have++;
        int comparables = coverage.getComparablesCount() == null ? 0 : coverage.getComparablesCount();
        int trends = coverage.getMarketTrendsCount() == null ? 0 : coverage.getMarketTrendsCount();

        String base = "This assessment draws on " + have + " of 8 diligence record types"
                + (comparables > 0 ? " and " + comparables + " comparable listings" : "") + ".";
        if (coverage.getMissingSections() == null || coverage.getMissingSections().isEmpty()) {
            return base.replace(".", " Complete coverage across all sections.");
        }
        return base + " Unavailable sections: "
                + String.join(", ", coverage.getMissingSections()) + ".";
    }

    /** Permit phrasing that reads correctly in a sentence. */
    private static String permitPhrase(String status) {
        return switch (statusOf(status, "PENDING").toUpperCase(Locale.ROOT)) {
            case "APPROVED" -> "the latest permit is approved";
            case "COMPLETED" -> "permitted works are completed";
            case "PENDING" -> "the latest permit remains pending approval";
            case "EXPIRED" -> "the latest permit has expired";
            default -> "the latest permit status is " + lowerHuman(status);
        };
    }

    private String marketContext(DiligenceDataResponse diligence) {
        if (diligence.getMarketTrends() == null || diligence.getMarketTrends().isEmpty()) {
            return null;
        }
        DiligenceDataResponse.MarketTrendRecord latest = diligence.getMarketTrends().get(0);
        String locality = latest.getLocality() != null ? latest.getLocality() : "the city";
        return "Comparable market data indicates an average asking price of ₹"
                + latest.getAvgPricePerSqft().stripTrailingZeros().toPlainString()
                + "/sqft in " + locality + " for " + latest.getPeriod() + ".";
    }

    private static double score(java.math.BigDecimal value) {
        return value == null ? 100 : value.doubleValue();
    }

    private static String statusOf(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static String humanize(String value) {
        if (value == null) {
            return "";
        }
        String lower = value.trim().toLowerCase(Locale.ROOT).replace('_', ' ');
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    private static String lowerHuman(String value) {
        return humanize(value).toLowerCase(Locale.ROOT);
    }

    private static String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
