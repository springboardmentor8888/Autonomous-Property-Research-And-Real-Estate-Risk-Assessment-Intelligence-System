package com.realestate.duediligence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tax_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "tax_year")
    private Integer year;

    @Column(name = "amount_paid")
    private Double amountPaid;

    @Column(name = "status")
    private String status;
}
