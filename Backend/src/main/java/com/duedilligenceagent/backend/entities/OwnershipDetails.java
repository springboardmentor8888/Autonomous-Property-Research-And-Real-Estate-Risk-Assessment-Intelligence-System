package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ownership_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ownership_id")
    private Long ownershipId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "owner_name", nullable = false, length = 100)
    private String ownerName;

    @Column(name = "ownership_type", length = 50)
    private String ownershipType;

    @Column(name = "record_date")
    private LocalDate recordDate;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "external_record_id", length = 100)
    private String externalRecordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Property property;
}