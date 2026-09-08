package com.realestate.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.PropertyHistory;
import com.realestate.backend.Exception.PropertyHistoryNotFoundException;
import com.realestate.backend.Exception.PropertyNotFoundException;
import com.realestate.backend.Repository.PropertyHistoryRepository;
import com.realestate.backend.Repository.PropertyRepository;

@Service
public class PropertyHistoryService {

    private final PropertyHistoryRepository propertyHistoryRepository;
    private final PropertyRepository propertyRepository;

    public PropertyHistoryService(
            PropertyHistoryRepository propertyHistoryRepository,
            PropertyRepository propertyRepository) {

        this.propertyHistoryRepository = propertyHistoryRepository;
        this.propertyRepository = propertyRepository;
    }

    public PropertyHistory createHistory(PropertyHistory history) {

        return propertyHistoryRepository.save(history);
    }

    public List<PropertyHistory> getAllHistory() {

        return propertyHistoryRepository.findAll();
    }

    public PropertyHistory getHistoryById(Long id) {

        return propertyHistoryRepository.findById(id)
                .orElseThrow(() ->
                        new PropertyHistoryNotFoundException(
                                "Property history not found"));
    }

    public List<PropertyHistory> getHistoryByPropertyId(Long propertyId) {

        if (!propertyRepository.existsById(propertyId)) {
            throw new PropertyNotFoundException(
                    "Property not found with id: " + propertyId);
        }

        return propertyHistoryRepository.findByPropertyId(propertyId);
    }
}