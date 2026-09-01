package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_assessment_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessmentDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "risk_assessment_id")
    private Long riskAssessmentId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "tax_risk", precision = 5, scale = 2)
    private BigDecimal taxRisk;

    @Column(name = "legal_risk", precision = 5, scale = 2)
    private BigDecimal legalRisk;

    @Column(name = "flood_risk", precision = 5, scale = 2)
    private BigDecimal floodRisk;

    @Column(name = "permit_compliance", precision = 5, scale = 2)
    private BigDecimal permitCompliance;

    @Column(name = "zoning_compliance", precision = 5, scale = 2)
    private BigDecimal zoningCompliance;

    @Column(name = "ownership_verification", precision = 5, scale = 2)
    private BigDecimal ownershipVerification;

    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "assessed_at", nullable = false)
    private LocalDateTime assessedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Property property;
}