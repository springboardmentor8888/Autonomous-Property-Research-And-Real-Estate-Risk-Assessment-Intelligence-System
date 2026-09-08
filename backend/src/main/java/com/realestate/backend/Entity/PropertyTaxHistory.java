package com.realestate.backend.Entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "property_tax_history")
public class PropertyTaxHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private Integer taxYear;

    @Column(nullable = false)
    private Double taxAmount;

    private String paymentStatus;

    private String paymentDate;

    @Column(length = 2000)
    private String notes;
}
