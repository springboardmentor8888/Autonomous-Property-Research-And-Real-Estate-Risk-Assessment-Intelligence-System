package com.duedilligenceagent.backend.controller;

import java.util.List;

import com.duedilligenceagent.backend.dto.AggregationRequest;
import com.duedilligenceagent.backend.dto.AggregationResponse;
import com.duedilligenceagent.backend.dto.AggregationRunSummary;
import com.duedilligenceagent.backend.dto.MonitoringStatusResponse;
import com.duedilligenceagent.backend.dto.RiskAssessmentResponse;
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
import com.duedilligenceagent.backend.service.PropertyMonitoringService;
import com.duedilligenceagent.backend.service.PropertySearchService;
import com.duedilligenceagent.backend.service.PropertyService;
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
    private final AggregationRunRepository aggregationRunRepository;
    private final RiskAssessmentDetailsRepository riskAssessmentRepository;
    private final UserRepository userRepository;

    public PropertyController(PropertyService propertyService,
                              PropertySearchService propertySearchService,
                              AggregationService aggregationService,
                              PropertyMonitoringService monitoringService,
                              AggregationRunRepository aggregationRunRepository,
                              RiskAssessmentDetailsRepository riskAssessmentRepository,
                              UserRepository userRepository) {
        this.propertyService = propertyService;
        this.propertySearchService = propertySearchService;
        this.aggregationService = aggregationService;
        this.monitoringService = monitoringService;
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
            @RequestBody AggregationRequest request) {
        return ResponseEntity.ok(aggregationService.aggregate(id, null, request));
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
                .build();
    }
}
