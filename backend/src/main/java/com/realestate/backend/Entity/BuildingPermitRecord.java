package com.realestate.backend.Entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "building_permit_records")
public class BuildingPermitRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private String permitNumber;

    @Column(nullable = false)
    private String permitType;

    private String issueDate;

    private String expiryDate;

    @Column(nullable = false)
    private String status;

    @Column(length = 2000)
    private String description;
}