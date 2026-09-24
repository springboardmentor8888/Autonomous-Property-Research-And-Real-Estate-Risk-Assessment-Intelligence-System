package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.MarketTrends;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarketTrendsRepository extends JpaRepository<MarketTrends, Long> {

    /** Market trend rows for a city/locality pair (seed dataset), newest period first. */
    List<MarketTrends> findByCityIgnoreCaseAndLocalityIgnoreCaseOrderByPeriodDesc(
            String city, String locality);

    /** City-level market trend rows (locality null), newest period first. */
    List<MarketTrends> findByCityIgnoreCaseAndLocalityIsNullOrderByPeriodDesc(String city);
}
