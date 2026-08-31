package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "property_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "ownership_id")
    private Long ownershipId;

    @Column(name = "tax_id")
    private Long taxId;

    @Column(name = "permit_id")
    private Long permitId;

    @Column(name = "zoning_id")
    private Long zoningId;

    @Column(name = "flood_zone_id")
    private Long floodZoneId;

    @Column(name = "environmental_id")
    private Long environmentalId;

    @Column(name = "utility_id")
    private Long utilityId;

    @Column(name = "captured_at", nullable = false)
    private LocalDateTime capturedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ownership_id", insertable = false, updatable = false)
    private OwnershipDetails ownershipDetails;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_id", insertable = false, updatable = false)
    private TaxDetails taxDetails;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permit_id", insertable = false, updatable = false)
    private BuildingPermitDetails buildingPermitDetails;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zoning_id", insertable = false, updatable = false)
    private ZoningDetails zoningDetails;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flood_zone_id", insertable = false, updatable = false)
    private FloodZoneDetails floodZoneDetails;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "environmental_id", insertable = false, updatable = false)
    private EnvironmentalDetails environmentalDetails;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utility_id", insertable = false, updatable = false)
    private UtilityDetails utilityDetails;
}