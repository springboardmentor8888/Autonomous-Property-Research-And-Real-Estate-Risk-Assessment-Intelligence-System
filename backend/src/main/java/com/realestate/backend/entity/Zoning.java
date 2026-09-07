package com.realestate.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "zoning")
public class Zoning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "zoning_code", nullable = false, length = 50)
    private String zoningCode;

    @Column(name = "zoning_type", length = 100)
    private String zoningType;

    @Column(name = "allowed_use", length = 255)
    private String allowedUse;

    @Column(length = 500)
    private String restrictions;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(length = 30)
    private String status = "ACTIVE";
}