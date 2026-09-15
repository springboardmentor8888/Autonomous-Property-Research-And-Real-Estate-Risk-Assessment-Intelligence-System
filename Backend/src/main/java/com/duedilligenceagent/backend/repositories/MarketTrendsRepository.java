package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.MarketTrends;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketTrendsRepository extends JpaRepository<MarketTrends, Long> {
}
