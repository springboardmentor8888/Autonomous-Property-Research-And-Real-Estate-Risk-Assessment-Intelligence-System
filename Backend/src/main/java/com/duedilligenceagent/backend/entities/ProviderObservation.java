package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "provider_observations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderObservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "observation_id")
    private Long observationId;

    @Column(name = "aggregation_run_id", nullable = false)
    private Long aggregationRunId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "provider", nullable = false, length = 50)
    private String provider;

    @Column(name = "operation", nullable = false, length = 100)
    private String operation;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "http_status")
    private Integer httpStatus;

    @Column(name = "external_record_id", length = 150)
    private String externalRecordId;

    @Lob
    @Column(name = "response_payload")
    private String responsePayload;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "retrieved_at", nullable = false)
    private LocalDateTime retrievedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aggregation_run_id", insertable = false, updatable = false)
    private AggregationRun aggregationRun;
}
