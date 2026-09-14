package com.realestate.backend.service;

import com.realestate.backend.dto.PropertyHistoryDTO;
import com.realestate.backend.dto.PropertyRequestDTO;
import com.realestate.backend.dto.PropertyResponseDTO;
import com.realestate.backend.dto.PropertySearchCriteriaDTO;

import java.util.List;

public interface PropertyService {

    PropertyResponseDTO createProperty(PropertyRequestDTO requestDTO);

    PropertyResponseDTO getPropertyById(Long id);

    List<PropertyResponseDTO> getAllProperties();

    PropertyResponseDTO updateProperty(Long id, PropertyRequestDTO requestDTO);

    void deleteProperty(Long id);

    List<PropertyResponseDTO> searchProperties(PropertySearchCriteriaDTO criteria);

    List<PropertyHistoryDTO> getPropertyHistory(Long propertyId);

    PropertyHistoryDTO addPropertyHistory(Long propertyId, PropertyHistoryDTO historyDTO);
}
