package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "utility_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilityDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "utility_id")
    private Long utilityId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "utility_type", length = 50)
    private String utilityType;

    @Column(name = "provider", length = 100)
    private String provider;

    @Column(name = "availability_status", length = 30)
    private String availabilityStatus;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "retrieved_at", nullable = false)
    private LocalDateTime retrievedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Property property;
}