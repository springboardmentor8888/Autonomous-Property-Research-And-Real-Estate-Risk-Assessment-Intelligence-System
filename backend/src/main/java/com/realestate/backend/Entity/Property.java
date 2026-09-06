package com.realestate.backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "properties")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String address;

    @NotBlank
    @Column(nullable = false)
    private String propertyType;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double price;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double area;

    @PositiveOrZero
    private Integer bedrooms;

    @PositiveOrZero
    private Integer bathrooms;

    @Column(nullable = false)
    private String status;

    @Column(length = 2000)
    private String description;
}