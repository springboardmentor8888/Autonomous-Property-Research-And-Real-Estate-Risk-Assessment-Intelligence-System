package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.RiskAssessmentResponse;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the risk scoring in PropertyService. Unstubbed
 * repository calls return empty lists/Optionals, which is exactly the
 * "no data for this factor" case, so each test stubs only what it needs.
 *
 * Scoring: tax overdue 30 / partial 15, flood HIGH 25 / MEDIUM 10,
 * zoning non-compliant 20, permit issue 15, environmental hazard 20.
 * Levels: 0-15 LOW, 16-40 MEDIUM, 41+ HIGH. Score capped at 100.
 */
@ExtendWith(MockitoExtension.class)
class PropertyServiceRiskTest {

	private static final long PROPERTY_ID = 1L;

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
	@DisplayName("a property with no red flags scores 0 and is LOW")
	void cleanProperty_isLow() {
		givenPropertyExists();

		RiskAssessmentResponse result = propertyService.getRiskAssessment(PROPERTY_ID);

		assertThat(result.getRiskScore()).isZero();
		assertThat(result.getOverallRiskLevel()).isEqualTo(RiskLevel.LOW);
		assertThat(result.getTaxRiskNote()).isEqualTo("No tax concerns");
	}

	@Test
	@DisplayName("partially paid tax scores 15, the top of LOW")
	void partiallyPaidTax_isStillLow() {
		givenPropertyExists();
		givenLatestTax(TaxStatus.PARTIALLY_PAID);

		RiskAssessmentResponse result = propertyService.getRiskAssessment(PROPERTY_ID);

		assertThat(result.getRiskScore()).isEqualTo(15);
		assertThat(result.getOverallRiskLevel()).isEqualTo(RiskLevel.LOW);
	}

	@Test
	@DisplayName("overdue tax scores 30 and is MEDIUM")
	void overdueTax_isMedium() {
		givenPropertyExists();
		givenLatestTax(TaxStatus.OVERDUE);

		RiskAssessmentResponse result = propertyService.getRiskAssessment(PROPERTY_ID);

		assertThat(result.getRiskScore()).isEqualTo(30);
		assertThat(result.getOverallRiskLevel()).isEqualTo(RiskLevel.MEDIUM);
		assertThat(result.getTaxRiskNote()).contains("overdue");
	}

	@Test
	@DisplayName("zoning issue + environmental hazard scores 40, the top of MEDIUM")
	void score40_isStillMedium() {
		givenPropertyExists();
		givenNonCompliantZoning();
		givenEnvironmentalHazard();

		RiskAssessmentResponse result = propertyService.getRiskAssessment(PROPERTY_ID);

		assertThat(result.getRiskScore()).isEqualTo(40);
		assertThat(result.getOverallRiskLevel()).isEqualTo(RiskLevel.MEDIUM);
	}

	@Test
	@DisplayName("overdue tax + permit issue scores 45, the bottom of HIGH")
	void score45_isHigh() {
		givenPropertyExists();
		givenLatestTax(TaxStatus.OVERDUE);
		givenPermitIssue();

		RiskAssessmentResponse result = propertyService.getRiskAssessment(PROPERTY_ID);

		assertThat(result.getRiskScore()).isEqualTo(45);
		assertThat(result.getOverallRiskLevel()).isEqualTo(RiskLevel.HIGH);
	}

	@Test
	@DisplayName("all five factors together are capped at 100, not 110")
	void allFactors_scoreIsCappedAtOneHundred() {
		givenPropertyExists();
		givenLatestTax(TaxStatus.OVERDUE);          // 30
		givenHighFloodRisk();                       // 25
		givenNonCompliantZoning();                  // 20
		givenPermitIssue();                         // 15
		givenEnvironmentalHazard();                 // 20  -> 110 before the cap

		RiskAssessmentResponse result = propertyService.getRiskAssessment(PROPERTY_ID);

		assertThat(result.getRiskScore()).isEqualTo(100);
		assertThat(result.getOverallRiskLevel()).isEqualTo(RiskLevel.HIGH);
	}

	@Test
	@DisplayName("an unknown property id is rejected")
	void unknownProperty_throws() {
		when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> propertyService.getRiskAssessment(99L))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessage("Property not found");
	}

	// ---------- helpers: set up one data source at a time ----------

	private void givenPropertyExists() {
		Property property = new Property();
		property.setId(PROPERTY_ID);
		when(propertyRepository.findById(PROPERTY_ID)).thenReturn(Optional.of(property));
	}

	private void givenLatestTax(TaxStatus status) {
		TaxHistory tax = new TaxHistory();
		tax.setYear(2025);
		tax.setStatus(status);
		when(taxHistoryRepository.findByPropertyId(PROPERTY_ID)).thenReturn(List.of(tax));
	}

	private void givenHighFloodRisk() {
		FloodZoneInfo flood = new FloodZoneInfo();
		flood.setZone("Zone AE");
		flood.setRiskLevel(RiskLevel.HIGH);
		when(floodZoneInfoRepository.findByPropertyId(PROPERTY_ID)).thenReturn(Optional.of(flood));
	}

	private void givenNonCompliantZoning() {
		ZoningInfo zoning = new ZoningInfo();
		zoning.setZoneType("Agricultural");
		zoning.setCompliant(false);
		when(zoningInfoRepository.findByPropertyId(PROPERTY_ID)).thenReturn(Optional.of(zoning));
	}

	private void givenPermitIssue() {
		PermitRecord permit = new PermitRecord();
		permit.setStatus(PermitStatus.PENDING);
		when(permitRecordRepository.findByPropertyId(PROPERTY_ID)).thenReturn(List.of(permit));
	}

	private void givenEnvironmentalHazard() {
		EnvironmentalRecord environmental = new EnvironmentalRecord();
		environmental.setHazardFound(true);
		environmental.setHazardType("Soil contamination");
		when(environmentalRecordRepository.findByPropertyId(PROPERTY_ID)).thenReturn(Optional.of(environmental));
	}
}