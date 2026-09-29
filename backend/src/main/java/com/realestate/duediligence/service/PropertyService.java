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
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

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

	public PropertyService(PropertyRepository propertyRepository, RestTemplate restTemplate,
			OwnershipRecordRepository ownershipRecordRepository, TaxHistoryRepository taxHistoryRepository,
			ZoningInfoRepository zoningInfoRepository, FloodZoneInfoRepository floodZoneInfoRepository,
			PermitRecordRepository permitRecordRepository, EnvironmentalRecordRepository environmentalRecordRepository,
			UtilityInfoRepository utilityInfoRepository, SimulatedRegistryService simulatedRegistryService) {
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
				+ java.net.URLEncoder.encode(address, java.nio.charset.StandardCharsets.UTF_8) + "&apiKey="
				+ geoapifyApiKey;

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

	/**
	 * Creates a new Property by validating the address via Geoapify first,
	 * rejecting duplicates, then saving the validated details.
	 */
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
			propertyType = (propertyTypeInput == null || propertyTypeInput.isBlank()) ? PropertyType.RESIDENTIAL
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

		ZoningInfo zoning = zoningInfoRepository.findByPropertyId(propertyId).orElseGet(() -> zoningInfoRepository
				.save(fetchWithRetry(() -> simulatedRegistryService.generateZoning(property), "Zoning Office")));

		FloodZoneInfo floodZone = floodZoneInfoRepository.findByPropertyId(propertyId)
				.orElseGet(() -> floodZoneInfoRepository.save(fetchWithRetry(
						() -> simulatedRegistryService.generateFloodZone(property), "Flood Zone Authority")));

		List<PermitRecord> permits = permitRecordRepository.findByPropertyId(propertyId);
		if (permits.isEmpty()) {
			permits = List.of(permitRecordRepository
					.save(fetchWithRetry(() -> simulatedRegistryService.generatePermit(property), "Permit Office")));
		}

		EnvironmentalRecord environmental = environmentalRecordRepository.findByPropertyId(propertyId)
				.orElseGet(() -> environmentalRecordRepository.save(fetchWithRetry(
						() -> simulatedRegistryService.generateEnvironmentalRecord(property), "Environmental Agency")));

		UtilityInfo utility = utilityInfoRepository.findByPropertyId(propertyId)
				.orElseGet(() -> utilityInfoRepository.save(fetchWithRetry(
						() -> simulatedRegistryService.generateUtilityInfo(property), "Utility Provider")));

		return new PropertyDetailsResponse(property.getId(), property.getAddress(), ownershipHistory, taxHistory,
				zoning, floodZone, permits, environmental, utility);
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

	// ---------- MILESTONE 3 ----------

	/**
	 * Calculates a risk assessment from the property's existing tax, flood, zoning,
	 * permit, and environmental records. Point values are a reasonable weighting of
	 * the factors the SRS names; the SRS does not specify exact weights.
	 */
	public RiskAssessmentResponse getRiskAssessment(Long propertyId) {

		propertyRepository.findById(propertyId).orElseThrow(() -> new IllegalArgumentException("Property not found"));

		int score = 0;
		String taxNote = "No tax concerns";
		String floodNote = "No flood concerns";
		String zoningNote = "Zoning compliant";
		String permitNote = "All permits in order";
		String environmentalNote = "No environmental hazards";

		List<TaxHistory> taxHistory = taxHistoryRepository.findByPropertyId(propertyId);
		if (!taxHistory.isEmpty()) {
			TaxHistory latest = taxHistory.get(0);
			if (latest.getStatus() == TaxStatus.OVERDUE) {
				score += 30;
				taxNote = "Tax payment overdue for " + latest.getYear();
			} else if (latest.getStatus() == TaxStatus.PARTIALLY_PAID) {
				score += 15;
				taxNote = "Tax partially paid for " + latest.getYear();
			}
		}

		FloodZoneInfo floodZone = floodZoneInfoRepository.findByPropertyId(propertyId).orElse(null);
		if (floodZone != null) {
			if (floodZone.getRiskLevel() == RiskLevel.HIGH) {
				score += 25;
				floodNote = "High flood risk (" + floodZone.getZone() + ")";
			} else if (floodZone.getRiskLevel() == RiskLevel.MEDIUM) {
				score += 10;
				floodNote = "Moderate flood risk (" + floodZone.getZone() + ")";
			}
		}

		ZoningInfo zoning = zoningInfoRepository.findByPropertyId(propertyId).orElse(null);
		if (zoning != null && !zoning.getCompliant()) {
			score += 20;
			zoningNote = "Zoning non-compliant (" + zoning.getZoneType() + ")";
		}

		List<PermitRecord> permits = permitRecordRepository.findByPropertyId(propertyId);
		boolean hasPermitIssue = permits.stream().anyMatch(p -> p.getStatus() == PermitStatus.PENDING
				|| p.getStatus() == PermitStatus.REJECTED || p.getStatus() == PermitStatus.EXPIRED);
		if (hasPermitIssue) {
			score += 15;
			permitNote = "One or more permits pending, rejected, or expired";
		}

		EnvironmentalRecord environmental = environmentalRecordRepository.findByPropertyId(propertyId).orElse(null);
		if (environmental != null && environmental.getHazardFound()) {
			score += 20;
			environmentalNote = "Environmental hazard found: " + environmental.getHazardType();
		}

		RiskLevel overallRisk;
		if (score >= 41) {
			overallRisk = RiskLevel.HIGH;
		} else if (score >= 16) {
			overallRisk = RiskLevel.MEDIUM;
		} else {
			overallRisk = RiskLevel.LOW;
		}

		return new RiskAssessmentResponse(propertyId, score, overallRisk, taxNote, floodNote, zoningNote, permitNote,
				environmentalNote);
	}

	/**
	 * Returns simulated comparable properties near the given property.
	 */
	public List<ComparablePropertyResponse> getComparables(Long propertyId) {

		Property property = propertyRepository.findById(propertyId)
				.orElseThrow(() -> new IllegalArgumentException("Property not found"));

		return simulatedRegistryService.generateComparables(property);
	}
}