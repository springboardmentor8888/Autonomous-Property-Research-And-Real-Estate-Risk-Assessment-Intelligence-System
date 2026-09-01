package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "zoning_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZoningDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "zoning_id")
    private Long zoningId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "zoning_code", nullable = false, length = 30)
    private String zoningCode;

    @Column(name = "zoning_status", length = 30)
    private String zoningStatus;

    @Column(name = "allowed_use", length = 200)
    private String allowedUse;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "retrieved_at", nullable = false)
    private LocalDateTime retrievedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Property property;
}