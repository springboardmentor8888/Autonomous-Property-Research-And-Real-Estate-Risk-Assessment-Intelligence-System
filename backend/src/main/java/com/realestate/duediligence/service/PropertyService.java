package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.AddressValidationResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Service class responsible for property search and address validation logic.
 */
@Service
public class PropertyService {

	private final PropertyRepository propertyRepository;
	private final RestTemplate restTemplate;

	@Value("${geoapify.api.key}")
	private String geoapifyApiKey;

	public PropertyService(PropertyRepository propertyRepository, RestTemplate restTemplate) {
		this.propertyRepository = propertyRepository;
		this.restTemplate = restTemplate;
	}

	/**
	 * Searches for properties whose address contains the given search term.
	 */
	public List<Property> searchByAddress(String address) {
		return propertyRepository.findByAddressContainingIgnoreCase(address);
	}

	/**
	 * Validates an address using the Geoapify Geocoding API.
	 *
	 * Sends the address to Geoapify, and if a match is found, extracts the
	 * formatted address, city, state, postal code, country, and coordinates.
	 */
	public AddressValidationResponse validateAddress(String address) {

		String url = "https://api.geoapify.com/v1/geocode/search?text="
				+ java.net.URLEncoder.encode(address, java.nio.charset.StandardCharsets.UTF_8)
				+ "&apiKey=" + geoapifyApiKey;

		Map<String, Object> response = restTemplate.getForObject(url, Map.class);

//		// TEMPORARY DEBUG LINE — remove once confirmed working.
//		System.out.println("GEOAPIFY RESPONSE: " + response);

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

		// Geoapify returns coordinates as [longitude, latitude] — reversed
		// order compared to most other geocoding APIs. Careful not to swap
		// these by accident.
		List<Number> coordinates = (List<Number>) geometry.get("coordinates");
		double lng = coordinates.get(0).doubleValue();
		double lat = coordinates.get(1).doubleValue();

		return new AddressValidationResponse(formattedAddress, city, state, postalCode, country, lat, lng, true);
	}
}