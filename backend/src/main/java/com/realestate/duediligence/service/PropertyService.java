package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.AddressValidationResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

/**
 * Service class responsible for handling business logic
 * related to Property operations.
 *
 * @Service tells Spring that this class is a service component
 * and should be managed by the Spring container.
 */
@Service
public class PropertyService {

    /*
     * Repository used to communicate with the database
     * for Property-related operations.
     *
     * final means the reference cannot be changed after
     * it is initialized through the constructor.
     */
    private final PropertyRepository propertyRepository;

    /*
     * RestTemplate is the standard Spring HTTP client used to call
     * external REST APIs (in this case, Geoapify).
     *
     * Spring Boot auto-configures it — we just inject it here.
     */
    private final RestTemplate restTemplate;

    /*
     * The Geoapify API key, read from application.properties.
     *
     * The @Value annotation binds the value of the property
     * "geoapify.api.key" from application.properties into this field
     * automatically when Spring creates this bean.
     */
    @Value("${geoapify.api.key}")
    private String geoapifyApiKey;

    /**
     * Constructor injection.
     *
     * Spring automatically provides instances of PropertyRepository
     * and RestTemplate when creating PropertyService.
     *
     * @param propertyRepository repository used for Property database operations
     * @param restTemplate       HTTP client used to call external APIs
     */
    public PropertyService(PropertyRepository propertyRepository,
                           RestTemplate restTemplate) {
        this.propertyRepository = propertyRepository;
        this.restTemplate = restTemplate;
    }

    /**
     * Searches for properties based on their address.
     *
     * The actual database operation is performed by
     * PropertyRepository's findByAddressContainingIgnoreCase() method.
     *
     * "Containing" allows partial address searches.
     * "IgnoreCase" makes the search case-insensitive.
     *
     * Example:
     * Searching for "hyd" can return "Hyderabad".
     *
     * @param address address or part of an address to search for
     * @return list of properties matching the given address
     */
    public List<Property> searchByAddress(String address) {
        return propertyRepository.findByAddressContainingIgnoreCase(address);
    }

    /**
     * Validates an address by calling the Geoapify Geocoding API
     * server-side, keeping the API key private (never sent to the browser).
     *
     * Flow:
     * 1. Build the Geoapify URL with the address and API key.
     * 2. Call Geoapify and parse the JSON response.
     * 3. If a match is found, extract address parts and coordinates.
     * 4. Return a filled AddressValidationResponse.
     * 5. If no match is found, return a response with valid = false.
     *
     * Geoapify response structure (simplified):
     * {
     *   "features": [
     *     {
     *       "properties": {
     *         "formatted": "...",
     *         "city": "...",
     *         "state": "...",
     *         "postcode": "...",
     *         "country": "..."
     *       },
     *       "geometry": {
     *         "coordinates": [longitude, latitude]
     *       }
     *     }
     *   ]
     * }
     *
     * @param address the full address string to validate
     * @return AddressValidationResponse with the validated address details
     */
    public AddressValidationResponse validateAddress(String address) {

        // --------------------------------------------------
        // Build the Geoapify geocoding URL.
        // UriComponentsBuilder properly encodes special characters
        // in the address (spaces, commas, etc.).
        // We use .build().toUri() to pass a URI object to RestTemplate
        // to prevent RestTemplate from double-encoding the URL string.
        // --------------------------------------------------
        java.net.URI url = UriComponentsBuilder
                .fromUriString("https://api.geoapify.com/v1/geocode/search")
                .queryParam("text", address)
                .queryParam("limit", 1)
                .queryParam("apiKey", geoapifyApiKey)
                .build()
                .toUri();

        // --------------------------------------------------
        // Call Geoapify.
        // getForObject() sends a GET request and deserialises
        // the JSON response into a nested Map structure.
        // --------------------------------------------------
        @SuppressWarnings("unchecked")
        Map<String, Object> geoapifyResponse =
                restTemplate.getForObject(url, Map.class);

        // --------------------------------------------------
        // Build a "not found" response to return if anything
        // goes wrong or no results come back.
        // --------------------------------------------------
        AddressValidationResponse notFound = new AddressValidationResponse();
        notFound.setValid(false);

        System.out.println("Geoapify Response: " + geoapifyResponse);
        if (geoapifyResponse == null) {
            System.out.println("geoapifyResponse is null");
            return notFound;
        }

        // --------------------------------------------------
        // Navigate into: response → features (list)
        // --------------------------------------------------
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> features =
                (List<Map<String, Object>>) geoapifyResponse.get("features");

        if (features == null || features.isEmpty()) {
            System.out.println("Features is null or empty");
            return notFound;
        }

        // Take the first (best-matching) result.
        Map<String, Object> firstFeature = features.get(0);

        // --------------------------------------------------
        // Navigate into: feature → properties
        // --------------------------------------------------
        @SuppressWarnings("unchecked")
        Map<String, Object> properties =
                (Map<String, Object>) firstFeature.get("properties");

        if (properties == null) {
            return notFound;
        }

        // --------------------------------------------------
        // Navigate into: feature → geometry → coordinates
        // Geoapify returns coordinates as [longitude, latitude].
        // --------------------------------------------------
        @SuppressWarnings("unchecked")
        Map<String, Object> geometry =
                (Map<String, Object>) firstFeature.get("geometry");

        if (geometry == null) {
            return notFound;
        }

        @SuppressWarnings("unchecked")
        List<Double> coordinates =
                (List<Double>) geometry.get("coordinates");

        if (coordinates == null || coordinates.size() < 2) {
            return notFound;
        }

        double longitude = coordinates.get(0);
        double latitude  = coordinates.get(1);

        // --------------------------------------------------
        // Helper: safely read a String value from the map.
        // --------------------------------------------------

        // --------------------------------------------------
        // Build and return the successful response.
        // --------------------------------------------------
        AddressValidationResponse response = new AddressValidationResponse();
        response.setValid(true);
        response.setFormattedAddress(getString(properties, "formatted"));
        response.setCity(resolveCity(properties));
        response.setState(getString(properties, "state"));
        response.setPostalCode(getString(properties, "postcode"));
        response.setCountry(getString(properties, "country"));
        response.setLatitude(latitude);
        response.setLongitude(longitude);

        return response;
    }

    // --------------------------------------------------
    // PRIVATE HELPERS
    // --------------------------------------------------

    /**
     * Safely reads a String value from a Map, returning null if absent.
     */
    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    /**
     * Resolves the city name from the properties map.
     *
     * Geoapify may return the city under different keys depending on the
     * type of settlement (city, town, village, municipality).
     * We try each key in order and return the first non-null value.
     */
    private String resolveCity(Map<String, Object> properties) {
        for (String key : List.of("city", "town", "village", "municipality")) {
            String value = getString(properties, key);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
