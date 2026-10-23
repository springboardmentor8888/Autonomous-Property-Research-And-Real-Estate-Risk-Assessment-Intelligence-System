package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.AddressValidationResponse;
import com.realestate.duediligence.dto.ComparablePropertyResponse;
import com.realestate.duediligence.dto.PropertyDetailsResponse;
import com.realestate.duediligence.dto.RiskAssessmentResponse;
import com.realestate.duediligence.entity.*;
import com.realestate.duediligence.exception.ExternalServiceException;
import com.realestate.duediligence.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PropertyService {

	private final PropertyRepository propertyRepository;
	private final RestTemplate restTemplate;
	private final OwnershipRecordRepository ownershipRecordRepository;
	private final TaxHistoryRepository taxHistoryRepository;
	private final ZoningInfoRepository zoningInfoRepository;
	private final FloodZoneInfoRepository floodZoneInfoRepository;
	private final PermitRecordRepository permitRecordRepository;
	private final EnvironmentalRecordRepository environmentalRecordRepository;
	private final UtilityInfoRepository utilityInfoRepository;
	private final SimulatedRegistryService simulatedRegistryService;

	@Value("${geoapify.api.key}")
	private String geoapifyApiKey;

	private static final int MAX_RETRIES = 3;

	public PropertyService(PropertyRepository propertyRepository,
			RestTemplate restTemplate,
			OwnershipRecordRepository ownershipRecordRepository,
			TaxHistoryRepository taxHistoryRepository,
			ZoningInfoRepository zoningInfoRepository,
			FloodZoneInfoRepository floodZoneInfoRepository,
			PermitRecordRepository permitRecordRepository,
			EnvironmentalRecordRepository environmentalRecordRepository,
			UtilityInfoRepository utilityInfoRepository,
			SimulatedRegistryService simulatedRegistryService) {
		this.propertyRepository = propertyRepository;
		this.restTemplate = restTemplate;
		this.ownershipRecordRepository = ownershipRecordRepository;
		this.taxHistoryRepository = taxHistoryRepository;
		this.zoningInfoRepository = zoningInfoRepository;
		this.floodZoneInfoRepository = floodZoneInfoRepository;
		this.permitRecordRepository = permitRecordRepository;
		this.environmentalRecordRepository = environmentalRecordRepository;
		this.utilityInfoRepository = utilityInfoRepository;
		this.simulatedRegistryService = simulatedRegistryService;
	}

	// ---------- MILESTONE 1 ----------

	public List<Property> searchByAddress(String address) {
		return propertyRepository.findByAddressContainingIgnoreCase(address);
	}

	public AddressValidationResponse validateAddress(String address) {

		String url = "https://api.geoapify.com/v1/geocode/search?text="
				+ java.net.URLEncoder.encode(address, java.nio.charset.StandardCharsets.UTF_8)
				+ "&apiKey=" + geoapifyApiKey;

		Map<String, Object> response = restTemplate.getForObject(url, Map.class);

		List<Map<String, Object>> features = (List<Map<String, Object>>) response.get("features");

		if (features == null || features.isEmpty()) {
			return new AddressValidationResponse(null, null, null, null, null, 0, 0, false);
		}

		Map<String, Object> firstFeature = features.get(0);
		Map<String, Object> properties = (Map<String, Object>) firstFeature.get("properties");
		Map<String, Object> geometry = (Map<String, Object>) firstFeature.get("geometry");

		String formattedAddress = (String) properties.get("formatted");
		String city = (String) properties.get("city");
		String state = (String) properties.get("state");
		String postalCode = (String) properties.get("postcode");
		String country = (String) properties.get("country");

		List<Number> coordinates = (List<Number>) geometry.get("coordinates");
		double lng = coordinates.get(0).doubleValue();
		double lat = coordinates.get(1).doubleValue();

		return new AddressValidationResponse(formattedAddress, city, state, postalCode, country, lat, lng, true);
	}

	// ---------- MILESTONE 2 ----------

	public Property createProperty(String rawAddress, String propertyTypeInput) {

		AddressValidationResponse validated = validateAddress(rawAddress);

		if (!validated.isValid()) {
			throw new IllegalArgumentException("Address could not be validated: " + rawAddress);
		}

		List<Property> existing = propertyRepository.findByAddressContainingIgnoreCase(validated.getFormattedAddress());
		if (!existing.isEmpty()) {
			throw new IllegalArgumentException("A property already exists for this address.");
		}

		PropertyType propertyType;
		try {
			propertyType = (propertyTypeInput == null || propertyTypeInput.isBlank())
					? PropertyType.RESIDENTIAL
					: PropertyType.valueOf(propertyTypeInput.toUpperCase());
		} catch (IllegalArgumentException e) {
			throw new IllegalArgumentException("Invalid property type: " + propertyTypeInput);
		}

		Property property = new Property();
		property.setAddress(validated.getFormattedAddress());
		property.setCity(validated.getCity() != null ? validated.getCity() : "Unknown");
		property.setState(validated.getState() != null ? validated.getState() : "Unknown");
		property.setZipCode(validated.getPostalCode() != null ? validated.getPostalCode() : "UNKNOWN");
		property.setPropertyType(propertyType);

		return propertyRepository.save(property);
	}

	public PropertyDetailsResponse getPropertyDetails(Long propertyId) {

		Property property = propertyRepository.findById(propertyId)
				.orElseThrow(() -> new IllegalArgumentException("Property not found"));

		List<OwnershipRecord> ownershipHistory = ownershipRecordRepository.findByPropertyId(propertyId);
		if (ownershipHistory.isEmpty()) {
			List<OwnershipRecord> generated = fetchWithRetry(
					() -> simulatedRegistryService.generateOwnershipHistory(property), "Land Registry");
			ownershipHistory = ownershipRecordRepository.saveAll(generated);
		}

		List<TaxHistory> taxHistory = taxHistoryRepository.findByPropertyId(propertyId);
		if (taxHistory.isEmpty()) {
			taxHistory = List.of(taxHistoryRepository.save(
					fetchWithRetry(() -> simulatedRegistryService.generateTaxHistory(property), "Tax Authority")));
		}

		ZoningInfo zoning = zoningInfoRepository.findByPropertyId(propertyId)
				.orElseGet(() -> zoningInfoRepository.save(
						fetchWithRetry(() -> simulatedRegistryService.generateZoning(property), "Zoning Office")));

		FloodZoneInfo floodZone = floodZoneInfoRepository.findByPropertyId(propertyId)
				.orElseGet(() -> floodZoneInfoRepository.save(
						fetchWithRetry(() -> simulatedRegistryService.generateFloodZone(property), "Flood Zone Authority")));

		List<PermitRecord> permits = permitRecordRepository.findByPropertyId(propertyId);
		if (permits.isEmpty()) {
			permits = List.of(permitRecordRepository.save(
					fetchWithRetry(() -> simulatedRegistryService.generatePermit(property), "Permit Office")));
		}

		EnvironmentalRecord environmental = environmentalRecordRepository.findByPropertyId(propertyId)
				.orElseGet(() -> environmentalRecordRepository.save(
						fetchWithRetry(() -> simulatedRegistryService.generateEnvironmentalRecord(property), "Environmental Agency")));

		UtilityInfo utility = utilityInfoRepository.findByPropertyId(propertyId)
				.orElseGet(() -> utilityInfoRepository.save(
						fetchWithRetry(() -> simulatedRegistryService.generateUtilityInfo(property), "Utility Provider")));

		return new PropertyDetailsResponse(property.getId(), property.getAddress(),
				ownershipHistory, taxHistory, zoning, floodZone, permits, environmental, utility);
	}

	private <T> T fetchWithRetry(java.util.function.Supplier<T> fetchOperation, String sourceName) {

		int attempts = 0;

		while (attempts < MAX_RETRIES) {
			try {
				if (Math.random() < 0.2) {
					throw new RuntimeException("Simulated timeout from " + sourceName);
				}
				return fetchOperation.get();

			} catch (Exception e) {
				attempts++;
				if (attempts >= MAX_RETRIES) {
					throw new ExternalServiceException(
							"Failed to retrieve data from " + sourceName + " after " + MAX_RETRIES + " attempts.");
				}
			}
		}

		throw new ExternalServiceException("Unexpected retry failure for " + sourceName);
	}

	// ---------- MILESTONE 3: RISK ASSESSMENT ----------

	/**
	 * Risk assessment for one property: fetches its five factor records,
	 * then applies the shared scoring rules.
	 */
	public RiskAssessmentResponse getRiskAssessment(Long propertyId) {

		propertyRepository.findById(propertyId)
				.orElseThrow(() -> new IllegalArgumentException("Property not found"));

		TaxHistory latestTax = latestTax(taxHistoryRepository.findByPropertyId(propertyId));
		FloodZoneInfo floodZone = floodZoneInfoRepository.findByPropertyId(propertyId).orElse(null);
		ZoningInfo zoning = zoningInfoRepository.findByPropertyId(propertyId).orElse(null);
		List<PermitRecord> permits = permitRecordRepository.findByPropertyId(propertyId);
		EnvironmentalRecord environmental = environmentalRecordRepository.findByPropertyId(propertyId).orElse(null);

		return buildRiskAssessment(propertyId, latestTax, floodZone, zoning, permits, environmental);
	}

	/**
	 * Risk level counts across ALL properties, for the admin dashboard.
	 *
	 * Performance: runs 6 bulk queries (properties + the 5 factor tables)
	 * and groups the rows in memory, instead of 6 queries per property.
	 * Properties are loaded first, inside one read-only transaction, so the
	 * eager property reference on each factor record is resolved from the
	 * persistence context instead of triggering a query per record.
	 * Properties with no factor data yet are counted as LOW, matching
	 * what getRiskAssessment returns for them.
	 */
	@Transactional(readOnly = true)
	public Map<String, Long> getRiskLevelDistribution() {

		List<Property> properties = propertyRepository.findAll();

		Map<Long, List<TaxHistory>> taxByProperty = taxHistoryRepository.findAll().stream()
				.collect(Collectors.groupingBy(t -> t.getProperty().getId()));
		Map<Long, FloodZoneInfo> floodByProperty = floodZoneInfoRepository.findAll().stream()
				.collect(Collectors.toMap(f -> f.getProperty().getId(), f -> f, (a, b) -> a));
		Map<Long, ZoningInfo> zoningByProperty = zoningInfoRepository.findAll().stream()
				.collect(Collectors.toMap(z -> z.getProperty().getId(), z -> z, (a, b) -> a));
		Map<Long, List<PermitRecord>> permitsByProperty = permitRecordRepository.findAll().stream()
				.collect(Collectors.groupingBy(p -> p.getProperty().getId()));
		Map<Long, EnvironmentalRecord> environmentalByProperty = environmentalRecordRepository.findAll().stream()
				.collect(Collectors.toMap(e -> e.getProperty().getId(), e -> e, (a, b) -> a));

		Map<String, Long> distribution = new LinkedHashMap<>();
		distribution.put("LOW", 0L);
		distribution.put("MEDIUM", 0L);
		distribution.put("HIGH", 0L);

		for (Property property : properties) {
			Long id = property.getId();
			RiskLevel level = buildRiskAssessment(
					id,
					latestTax(taxByProperty.getOrDefault(id, List.of())),
					floodByProperty.get(id),
					zoningByProperty.get(id),
					permitsByProperty.getOrDefault(id, List.of()),
					environmentalByProperty.get(id)).getOverallRiskLevel();
			distribution.merge(level.toString(), 1L, Long::sum);
		}

		return distribution;
	}

	/** The tax record for the most recent year, or null if there are none. */
	private TaxHistory latestTax(List<TaxHistory> records) {
		return records.stream().max(Comparator.comparing(TaxHistory::getYear)).orElse(null);
	}

	/**
	 * The single place the scoring rules live, used by both the
	 * per-property endpoint and the dashboard. Point values are a
	 * reasonable weighting of the factors the SRS names; the SRS does not
	 * specify exact weights.
	 *
	 * Levels: 0-15 LOW, 16-40 MEDIUM, 41+ HIGH. Score capped at 100.
	 */
	private RiskAssessmentResponse buildRiskAssessment(Long propertyId, TaxHistory latestTax,
			FloodZoneInfo floodZone, ZoningInfo zoning, List<PermitRecord> permits,
			EnvironmentalRecord environmental) {

		int score = 0;
		String taxNote = "No tax concerns";
		String floodNote = "No flood concerns";
		String zoningNote = "Zoning compliant";
		String permitNote = "All permits in order";
		String environmentalNote = "No environmental hazards";

		if (latestTax != null) {
			if (latestTax.getStatus() == TaxStatus.OVERDUE) {
				score += 30;
				taxNote = "Tax payment overdue for " + latestTax.getYear();
			} else if (latestTax.getStatus() == TaxStatus.PARTIALLY_PAID) {
				score += 15;
				taxNote = "Tax partially paid for " + latestTax.getYear();
			}
		}

		if (floodZone != null) {
			if (floodZone.getRiskLevel() == RiskLevel.HIGH) {
				score += 25;
				floodNote = "High flood risk (" + floodZone.getZone() + ")";
			} else if (floodZone.getRiskLevel() == RiskLevel.MEDIUM) {
				score += 10;
				floodNote = "Moderate flood risk (" + floodZone.getZone() + ")";
			}
		}

		if (zoning != null && !zoning.getCompliant()) {
			score += 20;
			zoningNote = "Zoning non-compliant (" + zoning.getZoneType() + ")";
		}

		boolean hasPermitIssue = permits.stream().anyMatch(p ->
				p.getStatus() == PermitStatus.PENDING
				|| p.getStatus() == PermitStatus.REJECTED
				|| p.getStatus() == PermitStatus.EXPIRED);
		if (hasPermitIssue) {
			score += 15;
			permitNote = "One or more permits pending, rejected, or expired";
		}

		if (environmental != null && environmental.getHazardFound()) {
			score += 20;
			environmentalNote = "Environmental hazard found: " + environmental.getHazardType();
		}

		// The factors can add up to 110, but reports display "score / 100".
		score = Math.min(score, 100);

		RiskLevel overallRisk;
		if (score >= 41) {
			overallRisk = RiskLevel.HIGH;
		} else if (score >= 16) {
			overallRisk = RiskLevel.MEDIUM;
		} else {
			overallRisk = RiskLevel.LOW;
		}

		return new RiskAssessmentResponse(propertyId, score, overallRisk,
				taxNote, floodNote, zoningNote, permitNote, environmentalNote);
	}

	// ---------- MILESTONE 3: COMPARABLES ----------

	public List<ComparablePropertyResponse> getComparables(Long propertyId) {

		Property property = propertyRepository.findById(propertyId)
				.orElseThrow(() -> new IllegalArgumentException("Property not found"));

		return simulatedRegistryService.generateComparables(property);
	}
}