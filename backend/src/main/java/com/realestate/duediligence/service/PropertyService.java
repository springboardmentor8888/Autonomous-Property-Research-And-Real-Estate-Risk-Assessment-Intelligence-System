package com.realestate.duediligence.service;

// DTO used to send address validation details back to the client
import com.realestate.duediligence.dto.AddressValidationResponse;

// Entity representing a property in the database
import com.realestate.duediligence.entity.Property;

// Repository used to interact with the Property table
import com.realestate.duediligence.repository.PropertyRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class PropertyService {

    // Repository used to search properties stored in the database
    private final PropertyRepository propertyRepository;

    // RestTemplate is used to make HTTP requests to external APIs
    private final RestTemplate restTemplate;

    // Reads the Google Maps API key from application.properties
    // Example:
    // google.maps.api.key=YOUR_API_KEY
    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;

    // Constructor injection for the repository and RestTemplate
    public PropertyService(PropertyRepository propertyRepository, RestTemplate restTemplate) {
        this.propertyRepository = propertyRepository;
        this.restTemplate = restTemplate;
    }

    // Searches the database for properties whose address contains
    // the given search text, ignoring uppercase/lowercase differences
    public List<Property> searchByAddress(String address) {
        return propertyRepository.findByAddressContainingIgnoreCase(address);
    }

    // Validates an address using the Google Maps Geocoding API
    // and returns information such as formatted address, city,
    // state, postal code, country, latitude and longitude
    public AddressValidationResponse validateAddress(String address) {

        // Build the Google Geocoding API URL.
        // URLEncoder converts spaces and special characters in the
        // address into a format that can safely be used in a URL.
        String url = "https://maps.googleapis.com/maps/api/geocode/json?address="
                + java.net.URLEncoder.encode(
                        address,
                        java.nio.charset.StandardCharsets.UTF_8
                )
                + "&key=" + googleMapsApiKey;

        // Send a GET request to Google Maps Geocoding API
        // and receive the response as a Map.
        Map<String, Object> response =
                restTemplate.getForObject(url, Map.class);

        // Extract the "results" array from Google's response.
        List<Map<String, Object>> results =
                (List<Map<String, Object>>) response.get("results");

        // If Google could not find the address,
        // return a response indicating that the address is invalid.
        if (results == null || results.isEmpty()) {
            return new AddressValidationResponse(
                    null,   // formatted address
                    null,   // city
                    null,   // state
                    null,   // postal code
                    null,   // country
                    0,      // latitude
                    0,      // longitude
                    false   // valid address
            );
        }

        // Get the first matching address returned by Google.
        Map<String, Object> firstResult = results.get(0);

        // Extract the geometry object from the result.
        // Geometry contains the location information.
        Map<String, Object> geometry =
                (Map<String, Object>) firstResult.get("geometry");

        // Extract the location object containing latitude and longitude.
        Map<String, Object> location =
                (Map<String, Object>) geometry.get("location");

        // Get Google's standardized/formatted version of the address.
        String formattedAddress =
                (String) firstResult.get("formatted_address");

        // Extract latitude from the location object.
        double lat =
                ((Number) location.get("lat")).doubleValue();

        // Extract longitude from the location object.
        double lng =
                ((Number) location.get("lng")).doubleValue();

        // Extract individual address components such as city,
        // state, postal code and country.
        List<Map<String, Object>> components =
                (List<Map<String, Object>>)
                        firstResult.get("address_components");

        // Find the city from the address components.
        String city =
                extractComponent(components, "locality");

        // Find the state from the address components.
        String state =
                extractComponent(
                        components,
                        "administrative_area_level_1"
                );

        // Find the postal/ZIP code.
        String postalCode =
                extractComponent(
                        components,
                        "postal_code"
                );

        // Find the country.
        String country =
                extractComponent(
                        components,
                        "country"
                );

        // Create and return the DTO containing all
        // validated address information.
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

    // Helper method used to find a specific component
    // from Google's address_components list.
    private String extractComponent(
            List<Map<String, Object>> components,
            String type) {

        // Loop through every address component.
        for (Map<String, Object> component : components) {

            // Get the types associated with this component.
            List<String> types =
                    (List<String>) component.get("types");

            // Check whether this component matches
            // the requested type.
            if (types.contains(type)) {

                // Return the readable name of the component.
                // Example: "Telangana", "India", "500001", etc.
                return (String) component.get("long_name");
            }
        }

        // Return null if the requested component was not found.
        return null;
    }
}
