package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "flood_zone_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloodZoneDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "flood_zone_id")
    private Long floodZoneId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "zone", length = 20)
    private String zone;

    @Column(name = "risk_level", length = 30)
    private String riskLevel;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "retrieved_at", nullable = false)
    private LocalDateTime retrievedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Property property;
}