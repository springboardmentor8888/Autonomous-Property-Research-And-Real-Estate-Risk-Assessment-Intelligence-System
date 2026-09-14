package com.realestate.backend.service.impl;

import com.realestate.backend.dto.PropertyHistoryDTO;
import com.realestate.backend.dto.PropertyRequestDTO;
import com.realestate.backend.dto.PropertyResponseDTO;
import com.realestate.backend.dto.PropertySearchCriteriaDTO;
import com.realestate.backend.entity.Property;
import com.realestate.backend.entity.PropertyHistory;
import com.realestate.backend.exception.ResourceNotFoundException;
import com.realestate.backend.repository.PropertyHistoryRepository;
import com.realestate.backend.repository.PropertyRepository;
import com.realestate.backend.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyHistoryRepository historyRepository;

    @Autowired
    public PropertyServiceImpl(PropertyRepository propertyRepository, PropertyHistoryRepository historyRepository) {
        this.propertyRepository = propertyRepository;
        this.historyRepository = historyRepository;
    }

    @Override
    public PropertyResponseDTO createProperty(PropertyRequestDTO requestDTO) {
        Property property = new Property();
        property.setTitle(requestDTO.getTitle());
        property.setAddress(requestDTO.getAddress());
        property.setCity(requestDTO.getCity());
        property.setState(requestDTO.getState());
        property.setZipCode(requestDTO.getZipCode());
        property.setCountry(requestDTO.getCountry() != null ? requestDTO.getCountry() : "USA");
        property.setPrice(requestDTO.getPrice());
        property.setBedrooms(requestDTO.getBedrooms());
        property.setBathrooms(requestDTO.getBathrooms());
        property.setSquareFeet(requestDTO.getSquareFeet());
        property.setPropertyType(requestDTO.getPropertyType() != null ? requestDTO.getPropertyType() : "Residential");
        property.setYearBuilt(requestDTO.getYearBuilt());
        property.setDescription(requestDTO.getDescription());
        property.setStatus(requestDTO.getStatus() != null ? requestDTO.getStatus() : "AVAILABLE");

        Property savedProperty = propertyRepository.save(property);

        // Record initial listing event in history
        PropertyHistory initialHistory = new PropertyHistory();
        initialHistory.setProperty(savedProperty);
        initialHistory.setEventDate(LocalDate.now());
        initialHistory.setEventType("LISTED");
        initialHistory.setPrice(savedProperty.getPrice());
        initialHistory.setDescription("Initial listing on platform");
        initialHistory.setSource("Internal");
        historyRepository.save(initialHistory);

        return mapToResponseDTO(savedProperty);
    }

    @Override
    public PropertyResponseDTO getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));
        return mapToResponseDTO(property);
    }

    @Override
    public List<PropertyResponseDTO> getAllProperties() {
        List<Property> properties = propertyRepository.findAll();
        List<PropertyResponseDTO> responseList = new ArrayList<>();
        for (Property property : properties) {
            responseList.add(mapToResponseDTO(property));
        }
        return responseList;
    }

    @Override
    public PropertyResponseDTO updateProperty(Long id, PropertyRequestDTO requestDTO) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        // If price changed, save record in history
        if (requestDTO.getPrice() != null && property.getPrice() != null &&
                property.getPrice().compareTo(requestDTO.getPrice()) != 0) {
            PropertyHistory priceHistory = new PropertyHistory();
            priceHistory.setProperty(property);
            priceHistory.setEventDate(LocalDate.now());
            priceHistory.setEventType("PRICE_CHANGED");
            priceHistory.setPrice(requestDTO.getPrice());
            priceHistory.setDescription("Price changed from $" + property.getPrice() + " to $" + requestDTO.getPrice());
            priceHistory.setSource("Internal Update");
            historyRepository.save(priceHistory);
        }

        property.setTitle(requestDTO.getTitle());
        property.setAddress(requestDTO.getAddress());
        property.setCity(requestDTO.getCity());
        property.setState(requestDTO.getState());
        property.setZipCode(requestDTO.getZipCode());
        if (requestDTO.getCountry() != null) property.setCountry(requestDTO.getCountry());
        property.setPrice(requestDTO.getPrice());
        property.setBedrooms(requestDTO.getBedrooms());
        property.setBathrooms(requestDTO.getBathrooms());
        property.setSquareFeet(requestDTO.getSquareFeet());
        if (requestDTO.getPropertyType() != null) property.setPropertyType(requestDTO.getPropertyType());
        property.setYearBuilt(requestDTO.getYearBuilt());
        property.setDescription(requestDTO.getDescription());
        if (requestDTO.getStatus() != null) property.setStatus(requestDTO.getStatus());

        Property updatedProperty = propertyRepository.save(property);
        return mapToResponseDTO(updatedProperty);
    }

    @Override
    public void deleteProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));
        propertyRepository.delete(property);
    }

    @Override
    public List<PropertyResponseDTO> searchProperties(PropertySearchCriteriaDTO criteria) {
        List<Property> searchResults = propertyRepository.searchProperties(
                criteria.getQuery(),
                criteria.getCity(),
                criteria.getState(),
                criteria.getZipCode(),
                criteria.getPropertyType(),
                criteria.getMinPrice(),
                criteria.getMaxPrice(),
                criteria.getMinBedrooms(),
                criteria.getMinBathrooms(),
                criteria.getStatus()
        );

        List<PropertyResponseDTO> responseList = new ArrayList<>();
        for (Property property : searchResults) {
            responseList.add(mapToResponseDTO(property));
        }
        return responseList;
    }

    @Override
    public List<PropertyHistoryDTO> getPropertyHistory(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
        }

        Sort sort = Sort.by(Sort.Direction.DESC, "eventDate");
        List<PropertyHistory> historyList = historyRepository.findByPropertyId(propertyId, sort);

        List<PropertyHistoryDTO> responseList = new ArrayList<>();
        for (PropertyHistory history : historyList) {
            responseList.add(mapHistoryToDTO(history));
        }
        return responseList;
    }

    @Override
    public PropertyHistoryDTO addPropertyHistory(Long propertyId, PropertyHistoryDTO historyDTO) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + propertyId));

        PropertyHistory history = new PropertyHistory();
        history.setProperty(property);
        history.setEventDate(historyDTO.getEventDate());
        history.setEventType(historyDTO.getEventType());
        history.setPrice(historyDTO.getPrice());
        history.setDescription(historyDTO.getDescription());
        history.setSource(historyDTO.getSource() != null ? historyDTO.getSource() : "Manual Entry");

        PropertyHistory savedHistory = historyRepository.save(history);
        return mapHistoryToDTO(savedHistory);
    }

    private PropertyResponseDTO mapToResponseDTO(Property property) {
        PropertyResponseDTO dto = new PropertyResponseDTO();
        dto.setId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setAddress(property.getAddress());
        dto.setCity(property.getCity());
        dto.setState(property.getState());
        dto.setZipCode(property.getZipCode());
        dto.setCountry(property.getCountry());
        dto.setPrice(property.getPrice());
        dto.setBedrooms(property.getBedrooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setSquareFeet(property.getSquareFeet());
        dto.setPropertyType(property.getPropertyType());
        dto.setYearBuilt(property.getYearBuilt());
        dto.setDescription(property.getDescription());
        dto.setStatus(property.getStatus());
        dto.setCreatedAt(property.getCreatedAt());
        dto.setUpdatedAt(property.getUpdatedAt());
        return dto;
    }

    private PropertyHistoryDTO mapHistoryToDTO(PropertyHistory history) {
        PropertyHistoryDTO dto = new PropertyHistoryDTO();
        dto.setId(history.getId());
        dto.setPropertyId(history.getProperty().getId());
        dto.setEventDate(history.getEventDate());
        dto.setEventType(history.getEventType());
        dto.setPrice(history.getPrice());
        dto.setDescription(history.getDescription());
        dto.setSource(history.getSource());
        dto.setRecordedAt(history.getRecordedAt());
        return dto;
    }
}
