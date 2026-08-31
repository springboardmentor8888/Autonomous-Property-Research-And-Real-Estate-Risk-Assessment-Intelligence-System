package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "comparable_property_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparablePropertyDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comparable_id")
    private Long comparableId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "external_listing_id", length = 100)
    private String externalListingId;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "locality", length = 100)
    private String locality;

    @Column(name = "property_type", length = 50)
    private String propertyType;

    @Column(name = "bhk", length = 10)
    private String bhk;

    @Column(name = "area_sqft")
    private Integer areaSqft;

    @Column(name = "price", precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "price_per_sqft", precision = 10, scale = 2)
    private BigDecimal pricePerSqft;

    @Column(name = "rera_id", length = 50)
    private String reraId;

    @Column(name = "verified")
    private Boolean verified = false;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "retrieved_at", nullable = false)
    private LocalDateTime retrievedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Property property;
}