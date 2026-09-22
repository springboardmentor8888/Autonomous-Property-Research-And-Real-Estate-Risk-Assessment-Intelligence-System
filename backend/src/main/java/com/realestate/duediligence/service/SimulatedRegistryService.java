package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Simulates external data sources since real government APIs are not
 * accessible for this project.
 *
 * WHY improved indexing: earlier versions used property.getId() % length
 * directly, which caused coincidental overlaps between different arrays
 * of similar length (e.g. two properties with IDs 5 apart would repeat
 * the same owner AND same zoning, since both arrays had length 5). This
 * version mixes in the property's address text too, spreading results
 * out so different properties look genuinely more varied.
 *
 * Note: the SAME property will always produce the SAME simulated values
 * on repeat requests — this is intentional (data is generated once and
 * saved, not regenerated randomly each time you view it).
 */
@Service
public class SimulatedRegistryService {

    private static final String[] OWNER_NAMES = {
            "R. Kumar", "S. Patel", "A. Reddy", "M. Iyer", "V. Nair", "K. Sharma", "P. Menon"
    };

    private static final String[] ZONE_TYPES = {
            "Residential - R1", "Residential - R2", "Commercial - C1", "Mixed-Use", "Agricultural"
    };

    private static final String[] FLOOD_ZONES = {
            "Zone X", "Zone A", "Zone AE", "Zone B"
    };

    private static final RiskLevel[] RISK_LEVELS = {
            RiskLevel.LOW, RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH
    };

    private static final String[] PERMIT_TYPES = {
            "Renovation", "Electrical", "Plumbing", "Addition", "Demolition"
    };

    private static final String[] UTILITY_PROVIDERS = {
            "City Utilities Board", "Metro Water Authority", "State Power Corporation"
    };

    /**
     * Produces a well-spread index using the property's id AND its
     * address text together, so different arrays don't coincidentally
     * pick the same index for nearby property IDs.
     */
    private int indexFor(Property property, int arrayLength, int salt) {
        long addressHash = property.getAddress() != null ? property.getAddress().hashCode() : 0;
        long seed = (property.getId() * 31L) + (addressHash * 17L) + salt;
        return (int) (Math.floorMod(seed, arrayLength));
    }

    public OwnershipRecord generateOwnership(Property property) {
        int i = indexFor(property, OWNER_NAMES.length, 1);

        OwnershipRecord record = new OwnershipRecord();
        record.setProperty(property);
        record.setOwnerName(OWNER_NAMES[i]);
        record.setAcquiredDate(LocalDate.of(2012 + i, 3, 12));
        return record;
    }

    public TaxHistory generateTaxHistory(Property property) {
        int i = indexFor(property, 6, 2);
        BigDecimal baseAmount = new BigDecimal("28000").add(new BigDecimal(i * 6500));

        TaxHistory record = new TaxHistory();
        record.setProperty(property);
        record.setYear(LocalDate.now().getYear() - 1);
        record.setAmountPaid(baseAmount);
        record.setStatus(i == 4 ? TaxStatus.OVERDUE : (i == 5 ? TaxStatus.PARTIALLY_PAID : TaxStatus.PAID));
        return record;
    }

    public ZoningInfo generateZoning(Property property) {
        int i = indexFor(property, ZONE_TYPES.length, 3);

        ZoningInfo record = new ZoningInfo();
        record.setProperty(property);
        record.setZoneType(ZONE_TYPES[i]);
        record.setCompliant(i != 4);
        return record;
    }

    public FloodZoneInfo generateFloodZone(Property property) {
        int i = indexFor(property, FLOOD_ZONES.length, 4);
        int riskIndex = indexFor(property, RISK_LEVELS.length, 5);

        FloodZoneInfo record = new FloodZoneInfo();
        record.setProperty(property);
        record.setZone(FLOOD_ZONES[i]);
        record.setRiskLevel(RISK_LEVELS[riskIndex]);
        return record;
    }

    public PermitRecord generatePermit(Property property) {
        int i = indexFor(property, PERMIT_TYPES.length, 6);

        PermitRecord record = new PermitRecord();
        record.setProperty(property);
        record.setPermitType(PERMIT_TYPES[i]);
        record.setStatus(i == 2 ? PermitStatus.PENDING : (i == 4 ? PermitStatus.EXPIRED : PermitStatus.APPROVED));
        record.setIssuedDate(LocalDate.of(2017 + i, 5, 1));
        return record;
    }

    public EnvironmentalRecord generateEnvironmentalRecord(Property property) {
        int i = indexFor(property, 5, 7);
        boolean hazard = (i == 3 || i == 4);

        EnvironmentalRecord record = new EnvironmentalRecord();
        record.setProperty(property);
        record.setHazardFound(hazard);
        record.setHazardType(hazard ? "Soil contamination" : "None");
        record.setAssessmentDate(LocalDate.of(2021 + (i % 4), 8, 15));
        return record;
    }

    public UtilityInfo generateUtilityInfo(Property property) {
        int i = indexFor(property, UTILITY_PROVIDERS.length, 8);

        UtilityInfo record = new UtilityInfo();
        record.setProperty(property);
        record.setWaterConnected(true);
        record.setElectricityConnected(i != 2);
        record.setGasConnected(i != 1);
        record.setProvider(UTILITY_PROVIDERS[i]);
        return record;
    }
}