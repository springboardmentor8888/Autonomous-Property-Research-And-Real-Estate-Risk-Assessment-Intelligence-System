package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.DiligenceDataResponse;
import com.duedilligenceagent.backend.dto.MarketAnalysisResponse;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

/**
 * <b>Stage 2 of the diligence workflow</b>: analyzes the property's stored
 * comparables and market trends. Pure computation over stored data — no
 * external calls, nothing persisted. The report stage folds the analysis
 * summary into the executive summary when it runs afterwards.
 * <p>
 * Positioning compares the property's own stored price (or price-per-sqft)
 * against the comparable-market average. Dataset properties without a
 * stored price get an explicit UNKNOWN verdict with a comparables-only
 * summary — no fabricated numbers.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MarketAnalysisService {

    private static final BigDecimal POSITION_TOLERANCE_PCT = BigDecimal.TEN;

    private final PropertyRepository propertyRepository;
    private final DiligenceService diligenceService;

    @Transactional(readOnly = true)
    public MarketAnalysisResponse analyze(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Property not found with id: " + propertyId));

        DiligenceDataResponse diligence = diligenceService.getDiligenceData(propertyId);
        List<DiligenceDataResponse.ComparableRecord> comparables = diligence.getComparables();
        List<DiligenceDataResponse.MarketTrendRecord> trends = diligence.getMarketTrends();

        MarketAnalysisResponse.ComparablesSummary comparablesSummary =
                comparables == null || comparables.isEmpty() ? null : summarize(comparables);
        MarketAnalysisResponse.Positioning positioning =
                positioning(property, comparablesSummary);
        MarketAnalysisResponse.MarketTrendSummary trend =
                trends == null || trends.isEmpty() ? null : toTrend(trends.get(0));

        String summary = buildSummary(comparablesSummary, positioning, trend);
        log.info("Market analysis for property id={}: {} comparables, trend={}",
                propertyId, comparables == null ? 0 : comparables.size(), trend != null);

        return MarketAnalysisResponse.builder()
                .propertyId(propertyId)
                .analyzedAt(LocalDateTime.now())
                .comparables(comparablesSummary)
                .positioning(positioning)
                .trend(trend)
                .summary(summary)
                .build();
    }

    private MarketAnalysisResponse.ComparablesSummary summarize(
            List<DiligenceDataResponse.ComparableRecord> comparables) {
        List<BigDecimal> prices = comparables.stream()
                .map(DiligenceDataResponse.ComparableRecord::getPrice)
                .filter(java.util.Objects::nonNull)
                .sorted()
                .toList();
        List<BigDecimal> perSqft = comparables.stream()
                .map(DiligenceDataResponse.ComparableRecord::getPricePerSqft)
                .filter(java.util.Objects::nonNull)
                .toList();

        if (prices.isEmpty() && perSqft.isEmpty()) {
            return MarketAnalysisResponse.ComparablesSummary.builder()
                    .count(comparables.size())
                    .build();
        }
        return MarketAnalysisResponse.ComparablesSummary.builder()
                .count(comparables.size())
                .averagePrice(avg(prices))
                .medianPrice(median(prices))
                .lowestPrice(prices.isEmpty() ? null : prices.get(0))
                .highestPrice(prices.isEmpty() ? null : prices.get(prices.size() - 1))
                .averagePricePerSqft(avg(perSqft))
                .build();
    }

    private MarketAnalysisResponse.Positioning positioning(
            Property property, MarketAnalysisResponse.ComparablesSummary comparables) {
        if (comparables == null) {
            return MarketAnalysisResponse.Positioning.builder()
                    .verdict("NO_COMPARABLES")
                    .note("No comparable listings are stored for this property yet.")
                    .build();
        }

        // Prefer total price; fall back to price-per-sqft.
        if (property.getPrice() != null && comparables.getAveragePrice() != null) {
            return versus(property.getPrice(), comparables.getAveragePrice(), "total price");
        }
        if (property.getPricePerSqft() != null && comparables.getAveragePricePerSqft() != null) {
            return versus(property.getPricePerSqft(), comparables.getAveragePricePerSqft(),
                    "price per sqft");
        }
        return MarketAnalysisResponse.Positioning.builder()
                .verdict("UNKNOWN")
                .note("The property has no price on record — comparables summary only.")
                .build();
    }

    private MarketAnalysisResponse.Positioning versus(BigDecimal propertyValue,
                                                      BigDecimal marketAverage, String basis) {
        BigDecimal delta = propertyValue.subtract(marketAverage)
                .multiply(BigDecimal.valueOf(100))
                .divide(marketAverage, 1, RoundingMode.HALF_UP);
        String verdict;
        if (delta.abs().compareTo(POSITION_TOLERANCE_PCT) <= 0) {
            verdict = "ALIGNED";
        } else {
            verdict = delta.signum() < 0 ? "BELOW_MARKET" : "ABOVE_MARKET";
        }
        return MarketAnalysisResponse.Positioning.builder()
                .verdict(verdict)
                .propertyPrice(propertyValue)
                .marketAveragePrice(marketAverage)
                .deltaPercent(delta)
                .basis(basis)
                .build();
    }

    private MarketAnalysisResponse.MarketTrendSummary toTrend(
            DiligenceDataResponse.MarketTrendRecord record) {
        return MarketAnalysisResponse.MarketTrendSummary.builder()
                .locality(record.getLocality())
                .period(record.getPeriod())
                .avgPricePerSqft(record.getAvgPricePerSqft())
                .supplyCount(record.getSupplyCount())
                .demandPulse(record.getDemandPulse())
                .build();
    }

    /** Professional one-liner consumed by the UI and the report summary. */
    private String buildSummary(MarketAnalysisResponse.ComparablesSummary comparables,
                                MarketAnalysisResponse.Positioning positioning,
                                MarketAnalysisResponse.MarketTrendSummary trend) {
        StringBuilder sb = new StringBuilder();
        if (comparables == null) {
            sb.append("No comparable listings are stored for this property yet. ");
        } else {
            sb.append(comparables.getCount()).append(" comparable listings average ");
            if (comparables.getAveragePrice() != null) {
                sb.append("₹").append(human(comparables.getAveragePrice()));
            } else if (comparables.getAveragePricePerSqft() != null) {
                sb.append("₹").append(human(comparables.getAveragePricePerSqft())).append("/sqft");
            } else {
                sb.append("no reported prices");
            }
            sb.append(". ");
        }
        if (positioning != null) {
            switch (positioning.getVerdict()) {
                case "BELOW_MARKET" -> sb.append("The property is priced ")
                        .append(positioning.getDeltaPercent().abs().toPlainString())
                        .append("% below the comparable-market average. ");
                case "ABOVE_MARKET" -> sb.append("The property is priced ")
                        .append(positioning.getDeltaPercent().toPlainString())
                        .append("% above the comparable-market average. ");
                case "ALIGNED" -> sb.append("The property is priced in line with the comparable market. ");
                case "UNKNOWN" -> sb.append("The property has no price on record, so its market position could not be determined. ");
                case "NO_COMPARABLES" -> { /* already stated above */ }
                default -> { }
            }
        }
        if (trend != null && trend.getAvgPricePerSqft() != null) {
            sb.append("Market data for ")
                    .append(trend.getLocality() != null ? trend.getLocality() : "the locality")
                    .append(" (").append(trend.getPeriod()).append("): average ₹")
                    .append(human(trend.getAvgPricePerSqft())).append("/sqft");
            if (trend.getSupplyCount() != null) {
                sb.append(", ").append(trend.getSupplyCount()).append(" active listings");
            }
            sb.append(". ");
        }
        return sb.toString().trim();
    }

    private static BigDecimal avg(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
    }

    private static BigDecimal median(List<BigDecimal> sorted) {
        if (sorted == null || sorted.isEmpty()) {
            return null;
        }
        int mid = sorted.size() / 2;
        return sorted.size() % 2 == 1
                ? sorted.get(mid)
                : sorted.get(mid - 1).add(sorted.get(mid))
                        .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
    }

    /** Indian-format-friendly plain number (no scientific notation). */
    private static String human(BigDecimal value) {
        return value == null ? "—" : value.stripTrailingZeros().toPlainString();
    }
}
