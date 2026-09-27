package com.duedilligenceagent.backend.controller;

import java.util.List;

import com.duedilligenceagent.backend.dto.AggregationRequest;
import com.duedilligenceagent.backend.dto.AggregationResponse;
import com.duedilligenceagent.backend.dto.AggregationRunSummary;
import com.duedilligenceagent.backend.dto.DiligenceDataResponse;
import com.duedilligenceagent.backend.dto.MarketAnalysisResponse;
import com.duedilligenceagent.backend.dto.MonitoringStatusResponse;
import com.duedilligenceagent.backend.dto.ReportResponse;
import com.duedilligenceagent.backend.dto.RiskAssessmentResponse;
import com.duedilligenceagent.backend.service.ReportPdfService;
import com.duedilligenceagent.backend.service.RiskAssessmentService;
import com.duedilligenceagent.backend.service.RiskAssessmentStageService;
import com.duedilligenceagent.backend.service.MarketAnalysisService;
import com.duedilligenceagent.backend.entities.AggregationRun;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.repositories.AggregationRunRepository;
import com.duedilligenceagent.backend.repositories.RiskAssessmentDetailsRepository;
import com.duedilligenceagent.backend.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.dto.Property.PropertySearchApiResponse;
import com.duedilligenceagent.backend.dto.PropertyResponse;
import com.duedilligenceagent.backend.service.DiligenceService;
import com.duedilligenceagent.backend.service.PropertyMonitoringService;
import com.duedilligenceagent.backend.service.search.PropertySearchService;
import com.duedilligenceagent.backend.service.PropertyService;
import com.duedilligenceagent.backend.service.ReportService;
import com.duedilligenceagent.backend.service.AggregationService;

/**
 * Property endpoints — search/CRUD, diligence aggregation, risk assessment
 * and per-user monitoring, all requiring a valid access token.
 */
@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;
    private final PropertySearchService propertySearchService;
    private final AggregationService aggregationService;
    private final PropertyMonitoringService monitoringService;
    private final DiligenceService diligenceService;
    private final ReportService reportService;
    private final ReportPdfService reportPdfService;
    private final RiskAssessmentStageService riskAssessmentStageService;
    private final MarketAnalysisService marketAnalysisService;
    private final AggregationRunRepository aggregationRunRepository;
    private final RiskAssessmentDetailsRepository riskAssessmentRepository;
    private final UserRepository userRepository;

    public PropertyController(PropertyService propertyService,
                              PropertySearchService propertySearchService,
                              AggregationService aggregationService,
                              PropertyMonitoringService monitoringService,
                              DiligenceService diligenceService,
                              ReportService reportService,
                              ReportPdfService reportPdfService,
                              RiskAssessmentStageService riskAssessmentStageService,
                              MarketAnalysisService marketAnalysisService,
                              AggregationRunRepository aggregationRunRepository,
                              RiskAssessmentDetailsRepository riskAssessmentRepository,
                              UserRepository userRepository) {
        this.propertyService = propertyService;
        this.propertySearchService = propertySearchService;
        this.aggregationService = aggregationService;
        this.monitoringService = monitoringService;
        this.diligenceService = diligenceService;
        this.reportService = reportService;
        this.reportPdfService = reportPdfService;
        this.riskAssessmentStageService = riskAssessmentStageService;
        this.marketAnalysisService = marketAnalysisService;
        this.aggregationRunRepository = aggregationRunRepository;
        this.riskAssessmentRepository = riskAssessmentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<PropertyResponse>> getAllProperties() {
        return ResponseEntity.ok(
                propertyService.getAllProperties()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getPropertyById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                propertyService.getPropertyById(id)
        );
    }

    /**
     * The current user's search history: every property they searched,
     * newest first (plus legacy rows created before user attribution).
     */
    @GetMapping("/searched")
    public ResponseEntity<List<PropertyResponse>> getSearchHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                propertyService.getSearchHistory(userIdOf(userDetails))
        );
    }

    /**
     * Address-based search backed by the Google Address Validation +
     * Apify 99acres pipeline. Persists the property attributed to the
     * current user so it shows up in their search history.
     */
    @PostMapping("/search")
    public ResponseEntity<PropertySearchApiResponse> searchByAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PropertyDetailsRequest request) {
        return ResponseEntity.ok(
                propertySearchService.searchByAddress(request, userIdOf(userDetails))
        );
    }

    /**
     * Runs the diligence aggregation pipeline for a property and stores
     * the run + provider observations.
     */
    @PostMapping("/{id}/aggregate")
    public ResponseEntity<AggregationResponse> aggregateProperty(
            @PathVariable Long id,
            @RequestBody(required = false) AggregationRequest request) {
        // Aggregation is standalone: it inventories the property's stored
        // diligence data only — no external providers are called.
        return ResponseEntity.ok(aggregationService.aggregate(id, null));
    }

    /** Past diligence aggregation runs for a property, newest first. */
    @GetMapping("/{id}/aggregations")
    public ResponseEntity<List<AggregationRunSummary>> getAggregationRuns(
            @PathVariable Long id) {

        propertyService.getPropertyById(id); // 404 when the property does not exist
        List<AggregationRunSummary> runs = aggregationRunRepository
                .findByPropertyIdOrderByStartedAtDesc(id)
                .stream()
                .map(this::toRunSummary)
                .toList();
        return ResponseEntity.ok(runs);
    }

    /**
     * Latest risk assessment for a property. 204 when no assessment has
     * been produced yet (the diligence providers are still contract-pending).
     */
    @GetMapping("/{id}/risk-assessment")
    public ResponseEntity<RiskAssessmentResponse> getRiskAssessment(
            @PathVariable Long id) {

        propertyService.getPropertyById(id); // 404 when the property does not exist
        return riskAssessmentRepository
                .findFirstByPropertyIdOrderByAssessedAtDesc(id)
                .map(this::toRiskResponse)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    /**
     * <b>Stage 1 of the diligence workflow</b>: executes the stored-data
     * aggregation pipeline and calculates the risk assessment from the
     * property's diligence records. User-triggered — the market-analysis
     * and report stages become available after this completes.
     */
    @PostMapping("/{id}/risk-assessment")
    public ResponseEntity<RiskAssessmentResponse> runRiskAssessment(
            @PathVariable Long id) {

        return ResponseEntity.ok(riskAssessmentStageService.run(id));
    }

    /**
     * <b>Stage 2 of the diligence workflow</b>: analyzes the stored
     * comparables and market trends — comparable statistics, the property's
     * market positioning and the latest trend record. Pure analysis over
     * stored data; available after the risk-assessment stage.
     */
    @PostMapping("/{id}/market-analysis")
    public ResponseEntity<MarketAnalysisResponse> runMarketAnalysis(
            @PathVariable Long id) {

        return ResponseEntity.ok(marketAnalysisService.analyze(id));
    }

    /**
     * The full due-diligence record set stored for a property: ownership,
     * tax, permits, zoning, flood, environmental, utilities, comparables
     * and market trends. Absent sections are omitted.
     */
    @GetMapping("/{id}/diligence")
    public ResponseEntity<DiligenceDataResponse> getDiligenceData(
            @PathVariable Long id) {

        return ResponseEntity.ok(diligenceService.getDiligenceData(id));
    }

    /**
     * Generates a due-diligence report from the stored data: calculates the
     * risk assessment from the diligence records, builds the executive
     * summary from the record statuses and persists the report for the
     * current user.
     */
    @PostMapping("/{id}/report")
    public ResponseEntity<ReportResponse> generateReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        return ResponseEntity.ok(
                reportService.generate(id, userIdOf(userDetails))
        );
    }

    /** Latest generated report for a property; 204 when none exists yet. */
    @GetMapping("/{id}/report")
    public ResponseEntity<ReportResponse> getLatestReport(
            @PathVariable Long id) {

        ReportResponse report = reportService.latest(id);
        return report == null
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(report);
    }

    /**
     * Downloads the latest generated report as a PDF (SRS: reports must
     * be downloadable). 404 when no report exists yet.
     */
    @GetMapping("/{id}/report/pdf")
    public ResponseEntity<byte[]> downloadReportPdf(
            @PathVariable Long id) {

        ReportResponse report = reportService.latest(id);
        if (report == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] pdf = reportPdfService.generate(report);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition",
                        "attachment; filename=\"due-diligence-report-" + id + ".pdf\"")
                .body(pdf);
    }

    /** Monitoring state of a property for the current user. */
    @GetMapping("/{id}/monitoring")
    public ResponseEntity<MonitoringStatusResponse> getMonitoring(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        return ResponseEntity.ok(
                monitoringService.getStatus(userIdOf(userDetails), id)
        );
    }

    /** Enables record-change monitoring of a property for the current user. */
    @PostMapping("/{id}/monitoring")
    public ResponseEntity<MonitoringStatusResponse> enableMonitoring(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        return ResponseEntity.ok(
                monitoringService.enable(userIdOf(userDetails), id)
        );
    }

    /** Disables record-change monitoring of a property for the current user. */
    @DeleteMapping("/{id}/monitoring")
    public ResponseEntity<MonitoringStatusResponse> disableMonitoring(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        return ResponseEntity.ok(
                monitoringService.disable(userIdOf(userDetails), id)
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<PropertyResponse>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String propertyType) {

        if (city != null && !city.isBlank()) {
            return ResponseEntity.ok(
                    propertyService.searchByCity(city)
            );
        }

        if (state != null && !state.isBlank()) {
            return ResponseEntity.ok(
                    propertyService.searchByState(state)
            );
        }

        if (propertyType != null && !propertyType.isBlank()) {
            return ResponseEntity.ok(
                    propertyService.searchByPropertyType(propertyType)
            );
        }

        return ResponseEntity.ok(
                propertyService.getAllProperties()
        );
    }

    /** Resolves the authenticated user's id from the JWT principal. */
    private Long userIdOf(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found: " + userDetails.getUsername()));
        return user.getUserId();
    }

    private AggregationRunSummary toRunSummary(AggregationRun run) {
        return AggregationRunSummary.builder()
                .aggregationRunId(run.getAggregationRunId())
                .propertyId(run.getPropertyId())
                .requestedAddress(run.getRequestedAddress())
                .status(run.getStatus())
                .startedAt(run.getStartedAt())
                .completedAt(run.getCompletedAt())
                .build();
    }

    private RiskAssessmentResponse toRiskResponse(RiskAssessmentDetails details) {
        return RiskAssessmentResponse.builder()
                .riskAssessmentId(details.getRiskAssessmentId())
                .propertyId(details.getPropertyId())
                .taxRisk(details.getTaxRisk())
                .legalRisk(details.getLegalRisk())
                .floodRisk(details.getFloodRisk())
                .permitCompliance(details.getPermitCompliance())
                .zoningCompliance(details.getZoningCompliance())
                .ownershipVerification(details.getOwnershipVerification())
                .overallScore(details.getOverallScore())
                .assessedAt(details.getAssessedAt())
                .riskTier(RiskAssessmentService.tierOf(details.getOverallScore()))
                .build();
    }
}
