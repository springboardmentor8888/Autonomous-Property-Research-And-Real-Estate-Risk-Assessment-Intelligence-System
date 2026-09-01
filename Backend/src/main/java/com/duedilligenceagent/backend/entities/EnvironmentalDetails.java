package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "environmental_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvironmentalDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "environmental_id")
    private Long environmentalId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "record_type", length = 50)
    private String recordType;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "risk_level", length = 30)
    private String riskLevel;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "external_record_id", length = 100)
    private String externalRecordId;

    @Column(name = "retrieved_at", nullable = false)
    private LocalDateTime retrievedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Property property;
}