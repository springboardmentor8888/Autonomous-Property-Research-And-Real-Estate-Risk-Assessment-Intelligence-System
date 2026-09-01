package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "building_permit_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuildingPermitDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permit_id")
    private Long permitId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "permit_number", nullable = false, length = 50)
    private String permitNumber;

    @Column(name = "permit_type", length = 50)
    private String permitType;

    @Column(name = "permit_status", length = 30)
    private String permitStatus;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "external_record_id", length = 100)
    private String externalRecordId;

    @Column(name = "retrieved_at", nullable = false)
    private LocalDateTime retrievedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Property property;
}