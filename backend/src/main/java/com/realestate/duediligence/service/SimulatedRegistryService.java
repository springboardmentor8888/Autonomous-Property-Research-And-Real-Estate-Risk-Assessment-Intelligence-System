package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.ComparablePropertyResponse;
import com.realestate.duediligence.entity.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class SimulatedRegistryService {

	private static final String[] OWNER_NAMES = { "R. Kumar", "S. Patel", "A. Reddy", "M. Iyer", "V. Nair", "K. Sharma",
			"P. Menon" };

	private static final String[] ZONE_TYPES = { "Residential - R1", "Residential - R2", "Commercial - C1", "Mixed-Use",
			"Agricultural" };

	private static final String[] FLOOD_ZONES = { "Zone X", "Zone A", "Zone AE", "Zone B" };

	private static final RiskLevel[] RISK_LEVELS = { RiskLevel.LOW, RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH };

	private static final String[] PERMIT_TYPES = { "Renovation", "Electrical", "Plumbing", "Addition", "Demolition" };

	private static final String[] UTILITY_PROVIDERS = { "City Utilities Board", "Metro Water Authority",
			"State Power Corporation" };

	private static final String[] NEARBY_STREET_NAMES = { "Cedar Street", "Maple Avenue", "Birchwood Lane", "Elm Court",
			"Oakridge Drive" };

	private int indexFor(Property property, int arrayLength, int salt) {
		long addressHash = property.getAddress() != null ? property.getAddress().hashCode() : 0;
		long seed = (property.getId() * 31L) + (addressHash * 17L) + salt;
		return (int) (Math.floorMod(seed, arrayLength));
	}

	/**
	 * Generates a simulated ownership HISTORY for a property — 2 to 3 past owners
	 * plus the current owner, each with an acquiredDate and a transferDate (null
	 * for the current, most recent owner).
	 */
	public List<OwnershipRecord> generateOwnershipHistory(Property property) {

		int historyLength = 2 + indexFor(property, 2, 9); // 2 or 3 owners total
		List<OwnershipRecord> history = new ArrayList<>();

		int startYear = 2005 + indexFor(property, 6, 10);

		for (int i = 0; i < historyLength; i++) {
			int ownerIndex = (int) Math.floorMod((property.getId() * 31L) + i + 20, OWNER_NAMES.length);

			LocalDate acquired = LocalDate.of(startYear + (i * 4), 3, 12);
			boolean isCurrentOwner = (i == historyLength - 1);
			LocalDate transferred = isCurrentOwner ? null : LocalDate.of(startYear + ((i + 1) * 4), 6, 1);

			OwnershipRecord record = new OwnershipRecord();
			record.setProperty(property);
			record.setOwnerName(OWNER_NAMES[ownerIndex]);
			record.setAcquiredDate(acquired);
			record.setTransferDate(transferred);

			history.add(record);
		}

		return history;
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

	public List<ComparablePropertyResponse> generateComparables(Property property) {

		List<ComparablePropertyResponse> comparables = new ArrayList<>();

		for (int i = 0; i < 3; i++) {
			int index = Math.floorMod((property.getId() * 31L) + i, NEARBY_STREET_NAMES.length);
			double basePrice = 4500000 + (index * 350000) + (i * 200000);
			double distance = 0.5 + (i * 0.7) + (index * 0.2);

			String address = (10 + index * 7) + " " + NEARBY_STREET_NAMES[index] + ", " + property.getCity();

			comparables.add(new ComparablePropertyResponse(address, basePrice, Math.round(distance * 10.0) / 10.0));
		}

		return comparables;
	}
}