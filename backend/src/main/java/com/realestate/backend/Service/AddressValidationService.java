package com.realestate.backend.Service;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.Property;
import com.realestate.backend.Repository.PropertyRepository;
import com.realestate.backend.dto.AddressValidationResponse;

@Service
public class AddressValidationService {

    private final PropertyRepository propertyRepository;

    public AddressValidationService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public AddressValidationResponse validateAddress(Long propertyId) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException("Property not found"));

        String address = property.getAddress();

        if (address == null || address.trim().isEmpty()) {

            return new AddressValidationResponse(
                    propertyId,
                    address,
                    false,
                    "Address is missing or empty.");
        }

        return new AddressValidationResponse(
                propertyId,
                address,
                true,
                "Address is valid.");
    }
}