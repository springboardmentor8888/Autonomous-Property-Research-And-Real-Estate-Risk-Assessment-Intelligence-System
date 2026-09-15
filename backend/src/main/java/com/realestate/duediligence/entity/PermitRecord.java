package com.realestate.duediligence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "permit_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermitRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "permit_type")
    private String permitType;

    @Column(name = "status")
    private String status;

    @Column(name = "issued_date")
    private LocalDate issuedDate;
}
