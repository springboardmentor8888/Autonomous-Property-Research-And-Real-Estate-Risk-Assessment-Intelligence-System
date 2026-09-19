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

/*
 * @Service tells Spring that this class contains business logic
 * and should be registered as a Spring-managed bean.
 *
 * PropertyController calls this service to perform property-related
 * operations instead of directly communicating with repositories.
 */
@Service
public class PropertyService {

	/*
	 * Repository used to search and retrieve Property records
	 * from the database.
	 */
	private final PropertyRepository propertyRepository;

	/*
	 * RestTemplate is used to communicate with the external
	 * Geoapify API for address validation.
	 */
	private final RestTemplate restTemplate;

	/*
	 * Repositories for the different property due-diligence
	 * sub-modules defined in the SRS.
	 */
	private final OwnershipRecordRepository ownershipRecordRepository;
	private final TaxHistoryRepository taxHistoryRepository;
	private final ZoningInfoRepository zoningInfoRepository;
	private final FloodZoneInfoRepository floodZoneInfoRepository;
	private final PermitRecordRepository permitRecordRepository;
	private final EnvironmentalRecordRepository environmentalRecordRepository;
	private final UtilityInfoRepository utilityInfoRepository;

	/*
	 * Service that simulates external government/utility data sources.
	 *
	 * Examples:
	 * Land Registry
	 * Tax Authority
	 * Zoning Office
	 * Flood Zone Authority
	 * Permit Office
	 * Environmental Agency
	 * Utility Provider
	 */
	private final SimulatedRegistryService simulatedRegistryService;

	/*
	 * Reads the Geoapify API key from application.properties.
	 *
	 * Example:
	 * geoapify.api.key=YOUR_API_KEY
	 *
	 * The API key is not hardcoded inside Java code.
	 */
	@Value("${geoapify.api.key}")
	private String geoapifyApiKey;

	/*
	 * Maximum number of attempts allowed when retrieving
	 * simulated external data.
	 */
	private static final int MAX_RETRIES = 3;


	/*
	 * Constructor injection.
	 *
	 * Spring automatically provides all required repositories,
	 * services and RestTemplate objects when creating this bean.
	 *
	 * Constructor injection is preferred because all dependencies
	 * are available when PropertyService is created.
	 */
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


	// ============================================================
	// MILESTONE 1 METHODS
	// ============================================================


	/*
	 * Searches for properties whose address contains the
	 * provided search text.
	 *
	 * Example:
	 *
	 * Input:
	 * "Hyderabad"
	 *
	 * Repository may return:
	 * "123 Road, Hyderabad"
	 * "45 Street, Hyderabad"
	 */
	public List<Property> searchByAddress(String address) {

		/*
		 * Spring Data JPA automatically implements this repository
		 * method based on its method name:
		 *
		 * findByAddressContainingIgnoreCase()
		 *
		 * Containing  -> partial text matching
		 * IgnoreCase  -> case-insensitive search
		 */
		return propertyRepository.findByAddressContainingIgnoreCase(address);
	}


	/*
	 * Validates/geocodes an address using the Geoapify API.
	 *
	 * The method:
	 *
	 * 1. Builds the Geoapify URL
	 * 2. Sends a GET request
	 * 3. Reads the JSON response
	 * 4. Extracts address and coordinate information
	 * 5. Converts it into our own AddressValidationResponse DTO
	 */
	public AddressValidationResponse validateAddress(String address) {

		/*
		 * Build the Geoapify API URL.
		 *
		 * URLEncoder.encode() converts special characters in the
		 * address into a URL-safe format.
		 *
		 * Example:
		 * "12 Main Street, Hyderabad"
		 * becomes a properly encoded query parameter.
		 */
		String url = "https://api.geoapify.com/v1/geocode/search?text="
				+ java.net.URLEncoder.encode(address, java.nio.charset.StandardCharsets.UTF_8)
				+ "&apiKey=" + geoapifyApiKey;


		/*
		 * Send a GET request to Geoapify.
		 *
		 * Map.class is used because we are reading the external
		 * JSON response dynamically rather than mapping it to
		 * a dedicated Geoapify Java class.
		 */
		Map<String, Object> response = restTemplate.getForObject(url, Map.class);


		/*
		 * Geoapify returns matching locations inside the
		 * "features" array.
		 */
		List<Map<String, Object>> features =
				(List<Map<String, Object>>) response.get("features");


		/*
		 * If Geoapify did not find any matching address,
		 * return an invalid AddressValidationResponse.
		 */
		if (features == null || features.isEmpty()) {

			return new AddressValidationResponse(
					null,
					null,
					null,
					null,
					null,
					0,
					0,
					false
			);
		}


		/*
		 * We use the first matching result returned by Geoapify.
		 */
		Map<String, Object> firstFeature = features.get(0);


		/*
		 * The "properties" object contains information such as:
		 *
		 * formatted address
		 * city
		 * state
		 * postal code
		 * country
		 */
		Map<String, Object> properties =
				(Map<String, Object>) firstFeature.get("properties");


		/*
		 * The "geometry" object contains geographic information,
		 * including longitude and latitude.
		 */
		Map<String, Object> geometry =
				(Map<String, Object>) firstFeature.get("geometry");


		// Extract address information from Geoapify's response.
		String formattedAddress = (String) properties.get("formatted");
		String city = (String) properties.get("city");
		String state = (String) properties.get("state");
		String postalCode = (String) properties.get("postcode");
		String country = (String) properties.get("country");


		/*
		 * Geoapify returns coordinates in this order:
		 *
		 * [longitude, latitude]
		 *
		 * Therefore:
		 * coordinates.get(0) -> longitude
		 * coordinates.get(1) -> latitude
		 */
		List<Number> coordinates =
				(List<Number>) geometry.get("coordinates");

		double lng = coordinates.get(0).doubleValue();
		double lat = coordinates.get(1).doubleValue();


		/*
		 * Convert the external API response into our own DTO.
		 *
		 * This keeps the rest of our application independent
		 * from Geoapify's response structure.
		 */
		return new AddressValidationResponse(
				formattedAddress,
				city,
				state,
				postalCode,
				country,
				lat,
				lng,
				true
		);
	}


	// ============================================================
	// MILESTONE 2:
	// PROPERTY DETAILS AGGREGATION
	//
	// All 7 SRS sub-modules are collected here.
	// ============================================================


	/*
	 * Retrieves complete due-diligence information for a property.
	 *
	 * Instead of making the frontend call seven different APIs,
	 * this method collects all required information and returns
	 * it through one PropertyDetailsResponse.
	 *
	 * SRS sub-modules:
	 *
	 * 1. Ownership
	 * 2. Tax History
	 * 3. Zoning
	 * 4. Flood Zone
	 * 5. Permits
	 * 6. Environmental
	 * 7. Utilities
	 */
	public PropertyDetailsResponse getPropertyDetails(Long propertyId) {


		/*
		 * First verify that the property actually exists.
		 *
		 * findById() returns Optional<Property>.
		 *
		 * If the property does not exist, an exception is thrown.
		 *
		 * GlobalExceptionHandler will catch this exception and
		 * convert it into the project's standard error response.
		 */
		Property property = propertyRepository.findById(propertyId)
				.orElseThrow(() ->
						new IllegalArgumentException("Property not found"));


		// ========================================================
		// 1. OWNERSHIP
		// ========================================================

		/*
		 * First check whether ownership information already
		 * exists in the database.
		 */
		OwnershipRecord ownership =
				ownershipRecordRepository.findByPropertyId(propertyId)
						.stream()
						.findFirst()

						/*
						 * If no ownership record exists:
						 *
						 * 1. Generate simulated external data
						 * 2. Use retry logic
						 * 3. Save the result in PostgreSQL
						 */
						.orElseGet(() ->
								ownershipRecordRepository.save(
										fetchWithRetry(
												() -> simulatedRegistryService.generateOwnership(property),
												"Land Registry"
										)
								)
						);


		// ========================================================
		// 2. TAX HISTORY
		// ========================================================

		/*
		 * Tax history can contain multiple records,
		 * so the repository returns a List.
		 */
		List<TaxHistory> taxHistory =
				taxHistoryRepository.findByPropertyId(propertyId);


		/*
		 * If there is no tax history in the database,
		 * generate a simulated record and save it.
		 */
		if (taxHistory.isEmpty()) {

			taxHistory = List.of(
					taxHistoryRepository.save(
							fetchWithRetry(
									() -> simulatedRegistryService.generateTaxHistory(property),
									"Tax Authority"
							)
					)
			);
		}


		// ========================================================
		// 3. ZONING
		// ========================================================

		/*
		 * Check whether zoning information already exists.
		 *
		 * findByPropertyId() returns Optional because a property
		 * is expected to have one zoning record in this design.
		 */
		ZoningInfo zoning =
				zoningInfoRepository.findByPropertyId(propertyId)
						.orElseGet(() ->
								zoningInfoRepository.save(
										fetchWithRetry(
												() -> simulatedRegistryService.generateZoning(property),
												"Zoning Office"
										)
								)
						);


		// ========================================================
		// 4. FLOOD ZONE
		// ========================================================

		/*
		 * Check the database first.
		 *
		 * If flood-zone information does not exist,
		 * generate it through the simulated external service,
		 * then save it.
		 */
		FloodZoneInfo floodZone =
				floodZoneInfoRepository.findByPropertyId(propertyId)
						.orElseGet(() ->
								floodZoneInfoRepository.save(
										fetchWithRetry(
												() -> simulatedRegistryService.generateFloodZone(property),
												"Flood Zone Authority"
										)
								)
						);


		// ========================================================
		// 5. PERMITS
		// ========================================================

		/*
		 * A property may have multiple permits,
		 * so the repository returns a List.
		 */
		List<PermitRecord> permits =
				permitRecordRepository.findByPropertyId(propertyId);


		/*
		 * If no permits exist, generate a simulated permit
		 * and save it.
		 */
		if (permits.isEmpty()) {

			permits = List.of(
					permitRecordRepository.save(
							fetchWithRetry(
									() -> simulatedRegistryService.generatePermit(property),
									"Permit Office"
							)
					)
			);
		}


		// ========================================================
		// 6. ENVIRONMENTAL INFORMATION
		// ========================================================

		/*
		 * Check whether environmental information already
		 * exists for this property.
		 *
		 * If it does not exist, generate simulated environmental
		 * assessment data and save it.
		 */
		EnvironmentalRecord environmental =
				environmentalRecordRepository.findByPropertyId(propertyId)
						.orElseGet(() ->
								environmentalRecordRepository.save(
										fetchWithRetry(
												() -> simulatedRegistryService.generateEnvironmentalRecord(property),
												"Environmental Agency"
										)
								)
						);


		// ========================================================
		// 7. UTILITY INFORMATION
		// ========================================================

		/*
		 * Check whether utility information already exists.
		 *
		 * If not, generate simulated information about:
		 *
		 * - Water
		 * - Electricity
		 * - Gas
		 * - Provider
		 */
		UtilityInfo utility =
				utilityInfoRepository.findByPropertyId(propertyId)
						.orElseGet(() ->
								utilityInfoRepository.save(
										fetchWithRetry(
												() -> simulatedRegistryService.generateUtilityInfo(property),
												"Utility Provider"
										)
								)
						);


		// ========================================================
		// BUILD FINAL RESPONSE
		// ========================================================

		/*
		 * All seven modules have now been retrieved.
		 *
		 * Create one PropertyDetailsResponse containing
		 * the complete due-diligence information.
		 *
		 * This DTO is returned to the controller, which sends
		 * it to the frontend/client as JSON.
		 */
		return new PropertyDetailsResponse(
				property.getId(),
				property.getAddress(),
				ownership,
				taxHistory,
				zoning,
				floodZone,
				permits,
				environmental,
				utility
		);
	}


	// ============================================================
	// GENERIC RETRY MECHANISM
	// ============================================================


	/*
	 * Generic method used to retry simulated external operations
	 * when they fail.
	 *
	 * <T> means this method can work with different return types.
	 *
	 * Examples:
	 *
	 * OwnershipRecord
	 * TaxHistory
	 * ZoningInfo
	 * FloodZoneInfo
	 * PermitRecord
	 * EnvironmentalRecord
	 * UtilityInfo
	 *
	 * Supplier<T> represents an operation that can be executed
	 * later and returns a value of type T.
	 */
	private <T> T fetchWithRetry(
			java.util.function.Supplier<T> fetchOperation,
			String sourceName) {


		// Keeps track of how many attempts have been made.
		int attempts = 0;


		/*
		 * Continue trying until the maximum number of retries
		 * has been reached.
		 */
		while (attempts < MAX_RETRIES) {

			try {

				/*
				 * Simulate a 20% chance of an external service timeout.
				 *
				 * Math.random() returns a value between 0.0 and 1.0.
				 *
				 * If it is less than 0.2:
				 *
				 *     Simulate failure
				 *
				 * Otherwise:
				 *
				 *     Continue normally
				 */
				if (Math.random() < 0.2) {

					throw new RuntimeException(
							"Simulated timeout from " + sourceName
					);
				}


				/*
				 * Execute the operation passed to this method.
				 *
				 * Example:
				 *
				 * () -> simulatedRegistryService.generateOwnership(property)
				 *
				 * fetchOperation.get() actually executes that operation.
				 */
				return fetchOperation.get();


			} catch (Exception e) {

				// Increase the attempt counter after a failure.
				attempts++;


				/*
				 * If all allowed attempts have failed,
				 * stop retrying and throw our custom exception.
				 */
				if (attempts >= MAX_RETRIES) {

					throw new ExternalServiceException(
							"Failed to retrieve data from "
							+ sourceName
							+ " after "
							+ MAX_RETRIES
							+ " attempts."
					);
				}
			}
		}


		/*
		 * Safety fallback.
		 *
		 * Normally the method either:
		 *
		 * 1. Successfully returns data, OR
		 * 2. Throws ExternalServiceException after max retries.
		 *
		 * This exception handles an unexpected situation where
		 * the loop finishes without either outcome.
		 */
		throw new ExternalServiceException(
				"Unexpected retry failure for " + sourceName
		);
	}
}
