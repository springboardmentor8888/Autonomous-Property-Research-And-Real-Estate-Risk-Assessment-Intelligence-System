package com.realestate.backend.Entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "flood_zone_verification")
public class FloodZoneVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private String floodZone;

    @Column(nullable = false)
    private String riskLevel;

    @Column(nullable = false)
    private String status;

    private String verificationDate;

    @Column(length = 2000)
    private String description;
}