package com.duedilligenceagent.backend.service;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.duedilligenceagent.backend.dto.PropertyResponse;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.repositories.PropertyRepository;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @Cacheable("properties")
    public List<PropertyResponse> getAllProperties() {
        return propertyRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Cacheable(value = "property", key = "#id")
    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Property not found with id: " + id
                        ));

        return toResponse(property);
    }

    public List<PropertyResponse> searchByCity(String city) {
        return propertyRepository.findByCityIgnoreCase(city)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PropertyResponse> searchByState(String state) {
        return propertyRepository.findByStateIgnoreCase(state)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PropertyResponse> searchByPropertyType(String propertyType) {
        return propertyRepository.findByPropertyTypeIgnoreCase(propertyType)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private PropertyResponse toResponse(Property property) {
        return new PropertyResponse(
                property.getPropertyId(),
                property.getAddress(),
                property.getCity(),
                property.getState(),
                property.getPostalCode(),
                property.getLatitude(),
                property.getLongitude(),
                property.getPropertyType()
        );
    }
}
