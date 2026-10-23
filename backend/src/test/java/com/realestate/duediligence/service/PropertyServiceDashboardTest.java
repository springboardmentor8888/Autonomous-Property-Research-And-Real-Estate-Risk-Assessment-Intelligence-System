package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.*;
import com.realestate.duediligence.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Tests for the bulk risk distribution used by the admin dashboard.
 * The scoring rules themselves are covered by PropertyServiceRiskTest;
 * these tests check that grouping rows by property and counting the
 * resulting levels works.
 */
@ExtendWith(MockitoExtension.class)
class PropertyServiceDashboardTest {

	@Mock
	private PropertyRepository propertyRepository;
	@Mock
	private RestTemplate restTemplate;
	@Mock
	private OwnershipRecordRepository ownershipRecordRepository;
	@Mock
	private TaxHistoryRepository taxHistoryRepository;
	@Mock
	private ZoningInfoRepository zoningInfoRepository;
	@Mock
	private FloodZoneInfoRepository floodZoneInfoRepository;
	@Mock
	private PermitRecordRepository permitRecordRepository;
	@Mock
	private EnvironmentalRecordRepository environmentalRecordRepository;
	@Mock
	private UtilityInfoRepository utilityInfoRepository;
	@Mock
	private SimulatedRegistryService simulatedRegistryService;

	@InjectMocks
	private PropertyService propertyService;

	@Test
	@DisplayName("counts properties per risk level, treating properties with no data as LOW")
	void distribution_countsEachLevel() {
		Property clean = property(1L);        // no records          -> 0   LOW
		Property overdue = property(2L);      // overdue tax          -> 30  MEDIUM
		Property severe = property(3L);       // overdue + permit     -> 45  HIGH
		Property flooded = property(4L);      // paid, high flood     -> 25  MEDIUM

		givenData(
				List.of(clean, overdue, severe, flooded),
				List.of(tax(overdue, 2025, TaxStatus.OVERDUE),
						tax(severe, 2025, TaxStatus.OVERDUE),
						tax(flooded, 2025, TaxStatus.PAID)),
				List.of(flood(flooded, RiskLevel.HIGH)),
				List.of(permit(severe, PermitStatus.PENDING)));

		Map<String, Long> result = propertyService.getRiskLevelDistribution();

		assertThat(result).containsEntry("LOW", 1L)
				.containsEntry("MEDIUM", 2L)
				.containsEntry("HIGH", 1L);
	}

	@Test
	@DisplayName("only the most recent tax year decides, even if an older year was overdue")
	void distribution_usesMostRecentTaxYear() {
		Property property = property(5L);

		givenData(
				List.of(property),
				List.of(tax(property, 2023, TaxStatus.OVERDUE),
						tax(property, 2025, TaxStatus.PAID)),
				List.of(),
				List.of());

		Map<String, Long> result = propertyService.getRiskLevelDistribution();

		assertThat(result).containsEntry("LOW", 1L)
				.containsEntry("MEDIUM", 0L)
				.containsEntry("HIGH", 0L);
	}

	// ---------- helpers ----------

	/** Stubs the six bulk queries. Zoning and environmental are empty here. */
	private void givenData(List<Property> properties, List<TaxHistory> taxes,
			List<FloodZoneInfo> floods, List<PermitRecord> permits) {
		when(propertyRepository.findAll()).thenReturn(properties);
		when(taxHistoryRepository.findAll()).thenReturn(taxes);
		when(floodZoneInfoRepository.findAll()).thenReturn(floods);
		when(zoningInfoRepository.findAll()).thenReturn(List.of());
		when(permitRecordRepository.findAll()).thenReturn(permits);
		when(environmentalRecordRepository.findAll()).thenReturn(List.of());
	}

	private Property property(Long id) {
		Property property = new Property();
		property.setId(id);
		return property;
	}

	private TaxHistory tax(Property property, int year, TaxStatus status) {
		TaxHistory tax = new TaxHistory();
		tax.setProperty(property);
		tax.setYear(year);
		tax.setStatus(status);
		return tax;
	}

	private FloodZoneInfo flood(Property property, RiskLevel level) {
		FloodZoneInfo flood = new FloodZoneInfo();
		flood.setProperty(property);
		flood.setZone("Zone AE");
		flood.setRiskLevel(level);
		return flood;
	}

	private PermitRecord permit(Property property, PermitStatus status) {
		PermitRecord permit = new PermitRecord();
		permit.setProperty(property);
		permit.setStatus(status);
		return permit;
	}
}