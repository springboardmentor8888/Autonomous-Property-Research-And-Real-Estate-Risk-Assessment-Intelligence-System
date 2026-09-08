package com.realestate.backend.Entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "utility_information")
public class UtilityInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private String utilityType;

    @Column(nullable = false)
    private String providerName;

    private String accountReference;

    @Column(nullable = false)
    private String status;

    private String verificationDate;

    @Column(length = 2000)
    private String description;
}