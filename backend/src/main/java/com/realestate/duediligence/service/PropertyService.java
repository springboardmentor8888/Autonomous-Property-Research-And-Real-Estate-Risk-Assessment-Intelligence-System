package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.AddressValidationResponse;
import com.realestate.duediligence.dto.PropertyDetailsResponse;
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

	// ---------- MILESTONE 1 METHODS ----------

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

	// ---------- NEW: CREATE A PROPERTY FROM A VALIDATED ADDRESS ----------

	/**
	 * Creates a new Property by first validating the given address via
	 * Geoapify, then saving it using the validated details. This is the
	 * missing connection between Address Validation and the rest of the
	 * system: without this, a new address could never become a real,
	 * searchable Property with Milestone 2 due diligence details.
	 */
	public Property createProperty(String rawAddress, String propertyTypeInput) {

	    AddressValidationResponse validated = validateAddress(rawAddress);

	    if (!validated.isValid()) {
	        throw new IllegalArgumentException("Address could not be validated: " + rawAddress);
	    }

	    // Prevent duplicate properties for the same validated address.
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

	// ---------- MILESTONE 2: PROPERTY DETAILS AGGREGATION ----------

	public PropertyDetailsResponse getPropertyDetails(Long propertyId) {

		Property property = propertyRepository.findById(propertyId)
				.orElseThrow(() -> new IllegalArgumentException("Property not found"));

		OwnershipRecord ownership = ownershipRecordRepository.findByPropertyId(propertyId)
				.stream().findFirst()
				.orElseGet(() -> ownershipRecordRepository.save(
						fetchWithRetry(() -> simulatedRegistryService.generateOwnership(property), "Land Registry")));

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
				ownership, taxHistory, zoning, floodZone, permits, environmental, utility);
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
}