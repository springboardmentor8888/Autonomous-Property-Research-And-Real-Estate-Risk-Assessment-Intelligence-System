package com.realestate.backend.Entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "ownership_records")
public class OwnershipRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private String ownerName;

    @Column(nullable = false)
    private String ownershipType;

    private String documentReference;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(length = 2000)
    private String verificationNotes;
}