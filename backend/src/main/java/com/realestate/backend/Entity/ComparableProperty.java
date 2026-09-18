package com.realestate.backend.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "comparable_properties")
public class ComparableProperty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "target_property_id", nullable = false)
    private Property targetProperty;

    @ManyToOne
    @JoinColumn(name = "comparable_property_id", nullable = false)
    private Property comparableProperty;

    private Double distance;

    private Double priceDifference;

    private Double pricePerSqft;

    @Column(length = 2000)
    private String comparisonNotes;
}