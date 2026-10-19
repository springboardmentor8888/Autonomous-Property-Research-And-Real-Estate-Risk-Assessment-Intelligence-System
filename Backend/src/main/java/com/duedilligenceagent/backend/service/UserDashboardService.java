package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.DiligenceDataResponse;
import com.duedilligenceagent.backend.dto.PropertyResponse;
import com.duedilligenceagent.backend.dto.UserDashboardResponse;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.PropertyMonitoring;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.repositories.PropertyMonitoringRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.RiskAssessmentDetailsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Role-dashboard aggregations (SRS RBAC). Every method is scoped to the
 * calling user's own properties — the search history defines the
 * portfolio, the latest stored risk assessment defines each property's
 * tier, and the dashboards choose which payload to render per role.
 * <p>
 * No access-control is involved: the endpoints simply never see another
 * user's data, so any authenticated role may call any of them.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserDashboardService {

    /** Domain score at or above which the review queue flags a property. */
    static final int REVIEW_THRESHOLD = 45;

    private final PropertyService propertyService;
    private final PropertyRepository propertyRepository;
    private final PropertyMonitoringRepository monitoringRepository;
    private final RiskAssessmentDetailsRepository riskAssessmentRepository;
    private final DiligenceService diligenceService;

    /** The caller's change-watch list: enabled monitors with property identity. */
    @Transactional(readOnly = true)
    public List<UserDashboardResponse.MonitoredProperty> monitoredProperties(Long userId) {
        return monitoringRepository.findByUserIdAndEnabledTrue(userId).stream()
                .flatMap(monitoring -> propertyRepository.findById(monitoring.getPropertyId())
                        .map(property -> toMonitored(monitoring, property)).stream())
                .toList();
    }

    /**
     * The legal reviewer's verification queue: the caller's properties
     * whose legal/environmental, permit or zoning position needs review —
     * an elevated domain score (>= 45) or a pending record status.
     */
    @Transactional(readOnly = true)
    public List<UserDashboardResponse.ReviewQueueItem> reviewQueue(Long userId) {
        List<UserDashboardResponse.ReviewQueueItem> queue = new ArrayList<>();
        for (PropertyResponse property : propertyService.getSearchHistory(userId)) {
            RiskAssessmentDetails assessment = latestAssessment(property.getPropertyId());
            if (assessment == null) {
                continue;
            }
            List<String> flags = flags(assessment, property.getPropertyId());
            if (!flags.isEmpty()) {
                queue.add(UserDashboardResponse.ReviewQueueItem.builder()
                        .propertyId(property.getPropertyId())
                        .address(property.getAddress())
                        .city(property.getCity())
                        .legalEnvironmentalRisk(assessment.getLegalRisk())
                        .permitCompliance(assessment.getPermitCompliance())
                        .zoningCompliance(assessment.getZoningCompliance())
                        .flags(flags)
                        .build());
            }
        }
        return queue;
    }

    /**
     * Risk-tier distribution over the caller's own portfolio — the same
     * tiering as the admin analytics, but scoped to the user's searched
     * properties, plus the HIGH-tier properties surfaced for attention.
     */
    @Transactional(readOnly = true)
    public UserDashboardResponse.PortfolioRisk portfolioRisk(Long userId) {
        long low = 0, moderate = 0, elevated = 0, high = 0, insufficient = 0;
        List<UserDashboardResponse.HighRiskProperty> highRisk = new ArrayList<>();

        for (PropertyResponse property : propertyService.getSearchHistory(userId)) {
            RiskAssessmentDetails assessment = latestAssessment(property.getPropertyId());
            if (assessment == null || assessment.getOverallScore() == null) {
                insufficient++;
                continue;
            }
            switch (RiskAssessmentService.tierOf(assessment.getOverallScore())) {
                case "LOW" -> low++;
                case "MODERATE" -> moderate++;
                case "ELEVATED" -> elevated++;
                case "HIGH" -> {
                    high++;
                    highRisk.add(UserDashboardResponse.HighRiskProperty.builder()
                            .propertyId(property.getPropertyId())
                            .address(property.getAddress())
                            .overallScore(assessment.getOverallScore())
                            .build());
                }
                default -> insufficient++;
            }
        }
        return UserDashboardResponse.PortfolioRisk.builder()
                .low(low).moderate(moderate).elevated(elevated).high(high)
                .insufficientData(insufficient)
                .totalAssessed(low + moderate + elevated + high + insufficient)
                .highRiskProperties(highRisk)
                .build();
    }

    // --- helpers ---

    /** Review flags for one property: elevated domain scores + pending statuses. */
    private List<String> flags(RiskAssessmentDetails assessment, Long propertyId) {
        List<String> flags = new ArrayList<>();
        if (scoreAtLeast(assessment.getLegalRisk())) {
            flags.add("Legal / environmental review needs attention");
        }
        if (scoreAtLeast(assessment.getPermitCompliance())) {
            flags.add("Building-permit compliance needs verification");
        }
        if (scoreAtLeast(assessment.getZoningCompliance())) {
            flags.add("Zoning compliance needs verification");
        }

        DiligenceDataResponse diligence = diligenceService.getDiligenceData(propertyId);
        if (hasPendingPermit(diligence)) {
            flags.add("Latest building permit is pending approval");
        }
        if (hasPendingZoning(diligence)) {
            flags.add("Zoning status is pending review");
        }
        return flags;
    }

    private static boolean hasPendingPermit(DiligenceDataResponse diligence) {
        return diligence.getPermits() != null && !diligence.getPermits().isEmpty()
                && "PENDING".equalsIgnoreCase(nullSafe(diligence.getPermits().get(0).getPermitStatus()));
    }

    private static boolean hasPendingZoning(DiligenceDataResponse diligence) {
        return diligence.getZoning() != null
                && "PENDING".equalsIgnoreCase(nullSafe(diligence.getZoning().getZoningStatus()));
    }

    private static boolean scoreAtLeast(BigDecimal score) {
        return score != null && score.doubleValue() >= REVIEW_THRESHOLD;
    }

    private RiskAssessmentDetails latestAssessment(Long propertyId) {
        return riskAssessmentRepository
                .findFirstByPropertyIdOrderByAssessedAtDesc(propertyId)
                .orElse(null);
    }

    private static UserDashboardResponse.MonitoredProperty toMonitored(
            PropertyMonitoring monitoring, Property property) {
        return UserDashboardResponse.MonitoredProperty.builder()
                .propertyId(property.getPropertyId())
                .address(property.getAddress())
                .city(property.getCity())
                .monitoredSince(monitoring.getCreatedAt())
                .lastCheckedAt(monitoring.getLastCheckedAt())
                .build();
    }

    private static String nullSafe(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }
}
