package com.realestate.duediligence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "zip_code")
    private String zipCode;

    @Column(name = "property_type")
    private String propertyType;

    @Column(name = "parcel_id")
    private String parcelId;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "acquired_date")
    private LocalDate acquiredDate;

    @Column(name = "zone_type")
    private String zoneType;

    @Column(name = "zone_compliant")
    private Boolean zoneCompliant;

    @Column(name = "flood_zone")
    private String floodZone;

    @Column(name = "flood_risk_level")
    private String floodRiskLevel;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
