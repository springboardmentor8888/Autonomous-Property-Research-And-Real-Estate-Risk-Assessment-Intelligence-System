package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.entities.BuildingPermitDetails;
import com.duedilligenceagent.backend.entities.EnvironmentalDetails;
import com.duedilligenceagent.backend.entities.FloodZoneDetails;
import com.duedilligenceagent.backend.entities.OwnershipDetails;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.RiskAssessmentDetails;
import com.duedilligenceagent.backend.entities.TaxDetails;
import com.duedilligenceagent.backend.entities.ZoningDetails;
import com.duedilligenceagent.backend.repositories.BuildingPermitDetailsRepository;
import com.duedilligenceagent.backend.repositories.EnvironmentalDetailsRepository;
import com.duedilligenceagent.backend.repositories.FloodZoneDetailsRepository;
import com.duedilligenceagent.backend.repositories.OwnershipDetailsRepository;
import com.duedilligenceagent.backend.repositories.RiskAssessmentDetailsRepository;
import com.duedilligenceagent.backend.repositories.TaxDetailsRepository;
import com.duedilligenceagent.backend.repositories.ZoningDetailsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Calculates a property's risk assessment from its stored diligence
 * records. All scores are 0–100 <b>risk</b> scores — higher means
 * riskier — matching the seeded demonstration dataset.
 *
 * <h2>Domain mapping (calibrated to the seed dataset)</h2>
 * <ul>
 *   <li>{@code taxRisk} ← tax payment status:
 *       PAID=5, PARTIALLY_PAID=35, OVERDUE=75, no record=50</li>
 *   <li>{@code floodRisk} ← flood risk level:
 *       LOW=5, MEDIUM=35, HIGH=75, UNKNOWN=50, no record=50</li>
 *   <li>{@code permitCompliance} (risk) ← permit status:
 *       APPROVED=10, COMPLETED=25, PENDING=45, EXPIRED=60, no record=50</li>
 *   <li>{@code zoningCompliance} (risk) ← zoning status:
 *       COMPLIANT=5, PENDING=45, NON_COMPLIANT=85, no record=50</li>
 *   <li>{@code legalRisk} ← environmental status:
 *       CLEAR=10, PENDING=35, FLAGGED=45, NOT_FOUND=80, no record=50</li>
 *   <li>{@code ownershipVerification} (risk) ← ownership type:
 *       FREEHOLD=10, JOINT_OWNERSHIP=20, LEASEHOLD=40, no record=50</li>
 * </ul>
 *
 * <h2>Overall score</h2>
 * Weighted average — tax and flood carry the most weight:
 * {@code 0.25*tax + 0.25*flood + 0.15*permit + 0.15*zoning + 0.10*legal + 0.10*ownership}.
 * (Sanity anchor: the all-clean seed property 1001 calculates to 7.75,
 * exactly its seeded baseline.)
 *
 * <h2>Properties without diligence records</h2>
 * External searches (Google/Apify path) have no records yet; their domains
 * score the neutral-unknown 50, adjusted by the signals we do have:
 * premise-level validated address −10 ownership risk, RERA-registered
 * listing −10 legal risk, verified listing −5 ownership risk. The
 * neutral-unknown 50 overall lands in the ELEVATED tier deliberately —
 * a property whose records could not be verified is not cleared.
 *
 * <h2>Tiers</h2>
 * LOW < 20 ≤ MODERATE < 40 ≤ ELEVATED < 55 ≤ HIGH.
 *
 * The engine is append-only: every calculation persists a NEW
 * risk_assessment_details row. The seeded baseline rows are the dataset's
 * own reference and are never modified.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RiskAssessmentService {

    static final BigDecimal UNKNOWN_SCORE = BigDecimal.valueOf(50);

    private static final BigDecimal TAX_WEIGHT = new BigDecimal("0.25");
    private static final BigDecimal FLOOD_WEIGHT = new BigDecimal("0.25");
    private static final BigDecimal PERMIT_WEIGHT = new BigDecimal("0.15");
    private static final BigDecimal ZONING_WEIGHT = new BigDecimal("0.15");
    private static final BigDecimal LEGAL_WEIGHT = new BigDecimal("0.10");
    private static final BigDecimal OWNERSHIP_WEIGHT = new BigDecimal("0.10");

    private final TaxDetailsRepository taxRepository;
    private final FloodZoneDetailsRepository floodRepository;
    private final BuildingPermitDetailsRepository permitRepository;
    private final ZoningDetailsRepository zoningRepository;
    private final EnvironmentalDetailsRepository environmentalRepository;
    private final OwnershipDetailsRepository ownershipRepository;
    private final RiskAssessmentDetailsRepository riskAssessmentRepository;

    /** Calculates the assessment from the stored records and persists it. */
    @Transactional
    public RiskAssessmentDetails calculateAndPersist(Property property) {
        RiskAssessmentDetails assessment = calculate(property);
        RiskAssessmentDetails saved = riskAssessmentRepository.save(assessment);
        log.info("Calculated risk assessment for property id={}: overall={} ({})",
                property.getPropertyId(), saved.getOverallScore(), tierOf(saved.getOverallScore()));
        return saved;
    }

    /** Pure calculation — visible for tests. */
    @Transactional(readOnly = true)
    public RiskAssessmentDetails calculate(Property property) {
        Long id = property.getPropertyId();

        Optional<TaxDetails> tax = firstOf(taxRepository.findByPropertyId(id));
        Optional<FloodZoneDetails> flood = firstOf(floodRepository.findByPropertyId(id));
        Optional<BuildingPermitDetails> permit =
                firstOf(permitRepository.findByPropertyId(id));
        Optional<ZoningDetails> zoning = firstOf(zoningRepository.findByPropertyId(id));
        Optional<EnvironmentalDetails> environmental =
                firstOf(environmentalRepository.findByPropertyId(id));
        Optional<OwnershipDetails> ownership = ownershipRepository.findByPropertyId(id);

        BigDecimal taxRisk = taxRisk(tax);
        BigDecimal floodRisk = floodRisk(flood);
        BigDecimal permitRisk = permitRisk(permit);
        BigDecimal zoningRisk = zoningRisk(zoning);
        BigDecimal legalRisk = legalRisk(environmental, property);
        BigDecimal ownershipRisk = ownershipRisk(ownership, property);

        BigDecimal overall = taxRisk.multiply(TAX_WEIGHT)
                .add(floodRisk.multiply(FLOOD_WEIGHT))
                .add(permitRisk.multiply(PERMIT_WEIGHT))
                .add(zoningRisk.multiply(ZONING_WEIGHT))
                .add(legalRisk.multiply(LEGAL_WEIGHT))
                .add(ownershipRisk.multiply(OWNERSHIP_WEIGHT))
                .setScale(2, RoundingMode.HALF_UP);

        return RiskAssessmentDetails.builder()
                .propertyId(id)
                .taxRisk(taxRisk)
                .legalRisk(legalRisk)
                .floodRisk(floodRisk)
                .permitCompliance(permitRisk)
                .zoningCompliance(zoningRisk)
                .ownershipVerification(ownershipRisk)
                .overallScore(overall)
                .assessedAt(LocalDateTime.now())
                .build();
    }

    /** Risk tier for an overall score: LOW / MODERATE / ELEVATED / HIGH. */
    static String tierOf(BigDecimal overall) {
        if (overall == null) {
            return "UNKNOWN";
        }
        double v = overall.doubleValue();
        if (v < 20) {
            return "LOW";
        }
        if (v < 40) {
            return "MODERATE";
        }
        if (v < 55) {
            return "ELEVATED";
        }
        return "HIGH";
    }

    // --- domain mappings ---

    BigDecimal taxRisk(Optional<TaxDetails> tax) {
        if (tax.isEmpty()) {
            return UNKNOWN_SCORE;
        }
        String status = normalize(tax.get().getPaymentStatus());
        return switch (status) {
            case "PAID" -> BigDecimal.valueOf(5);
            case "PARTIALLY_PAID" -> BigDecimal.valueOf(35);
            case "OVERDUE" -> BigDecimal.valueOf(75);
            default -> UNKNOWN_SCORE;
        };
    }

    BigDecimal floodRisk(Optional<FloodZoneDetails> flood) {
        if (flood.isEmpty()) {
            return UNKNOWN_SCORE;
        }
        return switch (normalize(flood.get().getRiskLevel())) {
            case "LOW" -> BigDecimal.valueOf(5);
            case "MEDIUM" -> BigDecimal.valueOf(35);
            case "HIGH" -> BigDecimal.valueOf(75);
            default -> UNKNOWN_SCORE; // UNKNOWN zone
        };
    }

    BigDecimal permitRisk(Optional<BuildingPermitDetails> permit) {
        if (permit.isEmpty()) {
            return UNKNOWN_SCORE;
        }
        return switch (normalize(permit.get().getPermitStatus())) {
            case "APPROVED" -> BigDecimal.valueOf(10);
            case "COMPLETED" -> BigDecimal.valueOf(25);
            case "PENDING" -> BigDecimal.valueOf(45);
            case "EXPIRED" -> BigDecimal.valueOf(60);
            default -> UNKNOWN_SCORE;
        };
    }

    BigDecimal zoningRisk(Optional<ZoningDetails> zoning) {
        if (zoning.isEmpty()) {
            return UNKNOWN_SCORE;
        }
        return switch (normalize(zoning.get().getZoningStatus())) {
            case "COMPLIANT" -> BigDecimal.valueOf(5);
            case "PENDING" -> BigDecimal.valueOf(45);
            case "NON_COMPLIANT" -> BigDecimal.valueOf(85);
            default -> UNKNOWN_SCORE;
        };
    }

    BigDecimal legalRisk(Optional<EnvironmentalDetails> environmental, Property property) {
        if (environmental.isEmpty()) {
            // No environmental record: neutral-unknown, improved by a RERA-registered listing.
            BigDecimal risk = UNKNOWN_SCORE;
            if (property.getReraId() != null && !property.getReraId().isBlank()) {
                risk = risk.subtract(BigDecimal.TEN);
            }
            return risk;
        }
        return switch (normalize(environmental.get().getStatus())) {
            case "CLEAR" -> BigDecimal.valueOf(10);
            case "PENDING" -> BigDecimal.valueOf(35);
            case "FLAGGED" -> BigDecimal.valueOf(45);
            case "NOT_FOUND" -> BigDecimal.valueOf(80);
            default -> UNKNOWN_SCORE;
        };
    }

    BigDecimal ownershipRisk(Optional<OwnershipDetails> ownership, Property property) {
        if (ownership.isEmpty()) {
            // No ownership record: neutral-unknown, improved by the signals we have.
            BigDecimal risk = UNKNOWN_SCORE;
            if (Boolean.TRUE.equals(property.getAddressComplete())
                    && "PREMISE".equalsIgnoreCase(nullSafe(property.getValidationGranularity()))) {
                risk = risk.subtract(BigDecimal.TEN);
            }
            if (Boolean.TRUE.equals(property.getVerified())) {
                risk = risk.subtract(BigDecimal.valueOf(5));
            }
            return risk;
        }
        return switch (normalize(ownership.get().getOwnershipType())) {
            case "FREEHOLD" -> BigDecimal.valueOf(10);
            case "JOINT_OWNERSHIP" -> BigDecimal.valueOf(20);
            case "LEASEHOLD" -> BigDecimal.valueOf(40);
            default -> BigDecimal.valueOf(30);
        };
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private static String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private static <T> Optional<T> firstOf(List<T> list) {
        return list == null || list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
