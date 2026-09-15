package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "market_trends")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketTrends {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "market_trend_id")
    private Long marketTrendId;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "locality", length = 100)
    private String locality;

    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "aggregation_run_id")
    private Long aggregationRunId;

    @Column(name = "period", nullable = false, length = 20)
    private String period;

    @Column(name = "avg_price_per_sqft", precision = 15, scale = 2)
    private BigDecimal averagePricePerSqft;

    @Column(name = "supply_count")
    private Integer supplyCount;

    @Column(name = "demand_pulse", precision = 5, scale = 2)
    private BigDecimal demandPulse;

    @Column(name = "source", nullable = false, length = 50)
    private String source;

    @Column(name = "investment_grade", length = 20)
    private String investmentGrade;

    @Column(name = "livability_grade", length = 20)
    private String livabilityGrade;

    @Column(name = "retrieved_at", nullable = false)
    private LocalDateTime retrievedAt;
}