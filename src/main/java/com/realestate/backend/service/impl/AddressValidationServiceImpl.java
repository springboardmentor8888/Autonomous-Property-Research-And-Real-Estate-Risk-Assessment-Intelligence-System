package com.realestate.backend.service.impl;

import com.realestate.backend.dto.AddressValidationRequestDTO;
import com.realestate.backend.dto.AddressValidationResponseDTO;
import com.realestate.backend.service.AddressValidationService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AddressValidationServiceImpl implements AddressValidationService {

    @Override
    public AddressValidationResponseDTO validateAddress(AddressValidationRequestDTO request) {
        List<String> suggestions = new ArrayList<>();
        boolean isValid = true;
        double confidence = 1.0;

        String street = request.getStreetAddress() != null ? request.getStreetAddress().trim() : "";
        String city = request.getCity() != null ? request.getCity().trim() : "";
        String state = request.getState() != null ? request.getState().trim() : "";
        String zip = request.getZipCode() != null ? request.getZipCode().trim() : "";
        String country = (request.getCountry() != null && !request.getCountry().isBlank()) ? request.getCountry().trim() : "USA";

        
        if (street.isEmpty()) {
            isValid = false;
            confidence -= 0.4;
            suggestions.add("Street address is required.");
        }

       
        if (city.isEmpty()) {
            isValid = false;
            confidence -= 0.3;
            suggestions.add("City name is required.");
        }

        
        if (state.isEmpty()) {
            isValid = false;
            confidence -= 0.2;
            suggestions.add("State is required.");
        }

        
        if (zip.isEmpty()) {
            isValid = false;
            confidence -= 0.3;
            suggestions.add("Postal/Zip code is required.");
        } else if (!zip.matches("^\\d{5}(-\\d{4})?$") && !zip.matches("^\\d{6}$")) {
            confidence -= 0.2;
            suggestions.add("Postal code format looks unusual. Please verify.");
        }

        
        String standardizedStreet = standardizeStreet(street);
        String standardizedCity = capitalizeWords(city);
        String standardizedState = state.toUpperCase();

        confidence = Math.max(0.0, Math.min(1.0, confidence));
        String status = isValid ? (confidence >= 0.8 ? "VALID" : "STANDARDIZED") : "INVALID";
        String message = isValid ? "Address is valid." : "Address validation failed. Missing required fields.";

        String formattedAddress = standardizedStreet + ", " + standardizedCity + ", " + standardizedState + " " + zip + ", " + country;
        String originalAddress = street + ", " + city + ", " + state + " " + zip;

        AddressValidationResponseDTO response = new AddressValidationResponseDTO();
        response.setValid(isValid);
        response.setStatus(status);
        response.setOriginalAddress(originalAddress);
        response.setFormattedAddress(formattedAddress);
        response.setCity(standardizedCity);
        response.setState(standardizedState);
        response.setZipCode(zip);
        response.setCountry(country);
        response.setConfidenceScore(confidence);
        response.setMessage(message);
        response.setSuggestions(suggestions);
        response.setIsDeliverable(isValid);

        return response;
    }

    private String standardizeStreet(String street) {
        if (street == null || street.isBlank()) {
            return "";
        }
        return street
                .replaceAll("(?i)\\bSt\\b\\.?", "Street")
                .replaceAll("(?i)\\bRd\\b\\.?", "Road")
                .replaceAll("(?i)\\bAve\\b\\.?", "Avenue")
                .replaceAll("(?i)\\bBlvd\\b\\.?", "Boulevard")
                .replaceAll("(?i)\\bDr\\b\\.?", "Drive");
    }

    private String capitalizeWords(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }
        String[] words = text.toLowerCase().split("\\s+");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                result.append(Character.toUpperCase(word.charAt(0)))
                      .append(word.substring(1))
                      .append(" ");
            }
        }
        return result.toString().trim();
    }
}
