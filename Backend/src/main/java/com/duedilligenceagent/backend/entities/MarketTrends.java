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

    @Column(name = "period", nullable = false, length = 20)
    private String period;

    @Column(name = "average_price", precision = 15, scale = 2)
    private BigDecimal averagePrice;

    @Column(name = "supply_count")
    private Integer supplyCount;

    @Column(name = "demand_pulse", precision = 5, scale = 2)
    private BigDecimal demandPulse;

    @Column(name = "retrieved_at", nullable = false)
    private LocalDateTime retrievedAt;
}