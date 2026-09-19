package com.realestate.duediligence.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Entity representing utility connection information for a property.
 *
 * WHY: Our SRS explicitly lists Utility Information as part of the
 * Due Diligence module — confirming active water/electricity/gas
 * connections before purchase.
 */
@Entity
@Table(name = "utility_info")
@Data
public class UtilityInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private Boolean waterConnected;

    @Column(nullable = false)
    private Boolean electricityConnected;

    @Column(nullable = false)
    private Boolean gasConnected;

    // Name of the primary utility provider serving this property.
    @Column(nullable = false)
    private String provider;
}