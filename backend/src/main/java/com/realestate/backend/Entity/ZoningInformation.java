package com.realestate.backend.Entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "zoning_information")
public class ZoningInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private String zoneType;

    @Column(nullable = false)
    private String allowedUse;

    private Integer maximumFloors;

    @Column(nullable = false)
    private String status;

    @Column(length = 2000)
    private String description;
}