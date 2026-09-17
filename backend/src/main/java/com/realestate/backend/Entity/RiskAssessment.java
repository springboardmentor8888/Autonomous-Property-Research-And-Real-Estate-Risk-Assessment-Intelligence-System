package com.realestate.backend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "risk_assessments")
public class RiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    private String legalRisk;

    private String taxRisk;

    private String floodRisk;

    private String permitRisk;

    private String zoningRisk;

    private String ownershipRisk;

    private Integer riskScore;

    private String overallRisk;

    @Column(length = 3000)
    private String summary;
}