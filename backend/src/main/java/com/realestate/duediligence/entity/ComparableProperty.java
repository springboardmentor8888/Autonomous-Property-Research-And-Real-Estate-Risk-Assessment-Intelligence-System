package com.realestate.duediligence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "comparable_properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparableProperty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "address")
    private String address;

    @Column(name = "price")
    private Double price;

    @Column(name = "distance_km")
    private Double distanceKm;
}
