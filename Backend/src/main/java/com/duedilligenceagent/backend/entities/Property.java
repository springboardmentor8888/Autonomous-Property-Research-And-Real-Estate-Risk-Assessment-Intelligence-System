package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A validated property snapshot (geocoded search result).
 * Address fields come from Google; {@code propertyType} holds one of the six
 * {@link com.duedilligenceagent.backend.entities.enums.PropertyType} labels,
 * or null when the type could not be determined with confidence.
 */
@Entity
@Table(name = "property_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "property_type", length = 50)
    private String propertyType;

    @Column(name = "google_place_id", length = 150)
    private String googlePlaceId;

    @Column(name = "validation_granularity", length = 40)
    private String validationGranularity;

    @Column(name = "geocode_granularity", length = 40)
    private String geocodeGranularity;

    @Column(name = "address_complete")
    private Boolean addressComplete;

    @Column(name = "government_identifier", length = 150)
    private String governmentIdentifier;

    @Column(name = "municipal_assessment_identifier", length = 150)
    private String municipalAssessmentIdentifier;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}