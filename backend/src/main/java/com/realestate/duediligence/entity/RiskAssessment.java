package com.realestate.duediligence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "risk_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel; // LOW, MEDIUM, HIGH

    @Column(name = "tax_risk")
    private String taxRisk;

    @Column(name = "flood_risk")
    private String floodRisk;

    @Column(name = "zoning_risk")
    private String zoningRisk;

    @Column(name = "permit_risk")
    private String permitRisk;
}
