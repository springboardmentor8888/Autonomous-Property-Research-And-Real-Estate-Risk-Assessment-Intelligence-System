package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.DiligenceDataResponse;
import com.duedilligenceagent.backend.entities.BuildingPermitDetails;
import com.duedilligenceagent.backend.entities.ComparablePropertyDetails;
import com.duedilligenceagent.backend.entities.EnvironmentalDetails;
import com.duedilligenceagent.backend.entities.FloodZoneDetails;
import com.duedilligenceagent.backend.entities.MarketTrends;
import com.duedilligenceagent.backend.entities.OwnershipDetails;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.TaxDetails;
import com.duedilligenceagent.backend.entities.UtilityDetails;
import com.duedilligenceagent.backend.entities.ZoningDetails;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.BuildingPermitDetailsRepository;
import com.duedilligenceagent.backend.repositories.ComparablePropertyDetailsRepository;
import com.duedilligenceagent.backend.repositories.EnvironmentalDetailsRepository;
import com.duedilligenceagent.backend.repositories.FloodZoneDetailsRepository;
import com.duedilligenceagent.backend.repositories.MarketTrendsRepository;
import com.duedilligenceagent.backend.repositories.OwnershipDetailsRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.TaxDetailsRepository;
import com.duedilligenceagent.backend.repositories.UtilityDetailsRepository;
import com.duedilligenceagent.backend.repositories.ZoningDetailsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Assembles the stored due-diligence record set for a property: ownership,
 * tax, permits, zoning, flood, environmental and utility records plus the
 * property's comparables and the market trends for its city/locality.
 * Read-only — the dataset is never modified through this service.
 */
@Service
@RequiredArgsConstructor
public class DiligenceService {

    private final PropertyRepository propertyRepository;
    private final OwnershipDetailsRepository ownershipRepository;
    private final TaxDetailsRepository taxRepository;
    private final BuildingPermitDetailsRepository permitRepository;
    private final ZoningDetailsRepository zoningRepository;
    private final FloodZoneDetailsRepository floodRepository;
    private final EnvironmentalDetailsRepository environmentalRepository;
    private final UtilityDetailsRepository utilityRepository;
    private final ComparablePropertyDetailsRepository comparableRepository;
    private final MarketTrendsRepository marketTrendsRepository;

    @Transactional(readOnly = true)
    public DiligenceDataResponse getDiligenceData(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Property not found with id: " + propertyId));

        DiligenceDataResponse.DiligenceDataResponseBuilder builder = DiligenceDataResponse.builder()
                .propertyId(propertyId);

        ownershipRepository.findByPropertyId(propertyId)
                .ifPresent(o -> builder.ownership(DiligenceDataResponse.OwnershipRecord.builder()
                        .ownerName(o.getOwnerName())
                        .ownershipType(o.getOwnershipType())
                        .recordDate(o.getRecordDate())
                        .source(o.getSource())
                        .build()));

        firstOf(taxRepository.findByPropertyId(propertyId))
                .ifPresent(t -> builder.tax(DiligenceDataResponse.TaxRecord.builder()
                        .taxPayDate(t.getTaxPayDate())
                        .taxAmount(t.getTaxAmount())
                        .taxDue(t.getTaxDue())
                        .paymentStatus(t.getPaymentStatus())
                        .source(t.getSource())
                        .build()));

        List<DiligenceDataResponse.PermitRecord> permits = permitRepository.findByPropertyId(propertyId)
                .stream()
                .map(p -> DiligenceDataResponse.PermitRecord.builder()
                        .permitNumber(p.getPermitNumber())
                        .permitType(p.getPermitType())
                        .permitStatus(p.getPermitStatus())
                        .issueDate(p.getIssueDate())
                        .completionDate(p.getCompletionDate())
                        .description(p.getDescription())
                        .build())
                .toList();
        if (!permits.isEmpty()) {
            builder.permits(permits);
        }

        firstOf(zoningRepository.findByPropertyId(propertyId))
                .ifPresent(z -> builder.zoning(DiligenceDataResponse.ZoningRecord.builder()
                        .zoningCode(z.getZoningCode())
                        .zoningStatus(z.getZoningStatus())
                        .allowedUse(z.getAllowedUse())
                        .effectiveFrom(z.getEffectiveFrom())
                        .effectiveTo(z.getEffectiveTo())
                        .build()));

        firstOf(floodRepository.findByPropertyId(propertyId))
                .ifPresent(f -> builder.flood(DiligenceDataResponse.FloodRecord.builder()
                        .zone(f.getZone())
                        .riskLevel(f.getRiskLevel())
                        .effectiveDate(f.getEffectiveDate())
                        .build()));

        firstOf(environmentalRepository.findByPropertyId(propertyId))
                .ifPresent(e -> builder.environmental(DiligenceDataResponse.EnvironmentalRecord.builder()
                        .recordType(e.getRecordType())
                        .status(e.getStatus())
                        .riskLevel(e.getRiskLevel())
                        .description(e.getDescription())
                        .build()));

        List<DiligenceDataResponse.UtilityRecord> utilities = utilityRepository.findByPropertyId(propertyId)
                .stream()
                .map(u -> DiligenceDataResponse.UtilityRecord.builder()
                        .utilityType(u.getUtilityType())
                        .provider(u.getProvider())
                        .availabilityStatus(u.getAvailabilityStatus())
                        .build())
                .toList();
        if (!utilities.isEmpty()) {
            builder.utilities(utilities);
        }

        List<DiligenceDataResponse.ComparableRecord> comparables =
                comparableRepository.findByPropertyId(propertyId)
                        .stream()
                        .map(this::toComparableRecord)
                        .toList();
        if (!comparables.isEmpty()) {
            builder.comparables(comparables);
        }

        List<DiligenceDataResponse.MarketTrendRecord> trends = marketTrends(property);
        if (!trends.isEmpty()) {
            builder.marketTrends(trends);
        }

        return builder.build();
    }

    /** First element of a record list as an Optional (single-record tables). */
    private static <T> java.util.Optional<T> firstOf(List<T> list) {
        return list == null || list.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(list.get(0));
    }

    /** Market trends for the property's locality, else city-level rows. */
    private List<DiligenceDataResponse.MarketTrendRecord> marketTrends(Property property) {
        List<MarketTrends> trends;
        if (property.getLocality() != null && !property.getLocality().isBlank()) {
            trends = marketTrendsRepository.findByCityIgnoreCaseAndLocalityIgnoreCaseOrderByPeriodDesc(
                    property.getCity(), property.getLocality());
        } else {
            trends = List.of();
        }
        if (trends.isEmpty()) {
            trends = marketTrendsRepository
                    .findByCityIgnoreCaseAndLocalityIsNullOrderByPeriodDesc(property.getCity());
        }
        return trends.stream()
                .map(t -> DiligenceDataResponse.MarketTrendRecord.builder()
                        .locality(t.getLocality())
                        .period(t.getPeriod())
                        .avgPricePerSqft(t.getAveragePricePerSqft())
                        .supplyCount(t.getSupplyCount())
                        .demandPulse(t.getDemandPulse())
                        .build())
                .toList();
    }

    private DiligenceDataResponse.ComparableRecord toComparableRecord(ComparablePropertyDetails c) {
        return DiligenceDataResponse.ComparableRecord.builder()
                .listingId(c.getExternalListingId())
                .locality(c.getLocality())
                .propertyType(c.getPropertyType())
                .bhk(c.getBhk())
                .areaSqft(c.getAreaSqft())
                .price(c.getPrice())
                .pricePerSqft(c.getPricePerSqft())
                .reraId(c.getReraId())
                .verified(c.getVerified())
                .build();
    }
}
