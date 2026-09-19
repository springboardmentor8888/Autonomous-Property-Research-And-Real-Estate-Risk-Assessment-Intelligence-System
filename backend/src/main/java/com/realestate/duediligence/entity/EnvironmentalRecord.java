package com.realestate.duediligence.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

/**
 * Entity representing an environmental assessment record for a property.
 *
 * WHY: Our SRS explicitly lists Environmental Records as part of the
 * Due Diligence module — checking for contamination or hazards that
 * could affect a buyer's decision.
 */
@Entity
@Table(name = "environmental_records")
@Data
public class EnvironmentalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    // Whether any contamination or environmental hazard was found.
    @Column(nullable = false)
    private Boolean hazardFound;

    // Description of the hazard type, if any (e.g. "None", "Soil contamination").
    @Column(nullable = false)
    private String hazardType;

    // Date this environmental assessment was conducted.
    @Column(nullable = false)
    private LocalDate assessmentDate;
}