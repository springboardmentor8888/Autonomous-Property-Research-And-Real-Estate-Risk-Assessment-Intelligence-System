package com.realestate.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.PropertyValueHistory;
import com.realestate.backend.Repository.PropertyValueHistoryRepository;

@Service
public class PropertyValueHistoryService {

    private final PropertyValueHistoryRepository propertyValueHistoryRepository;

    public PropertyValueHistoryService(
            PropertyValueHistoryRepository propertyValueHistoryRepository) {

        this.propertyValueHistoryRepository =
                propertyValueHistoryRepository;
    }

    public PropertyValueHistory createValueHistory(
            PropertyValueHistory history) {

        return propertyValueHistoryRepository.save(history);
    }

    public List<PropertyValueHistory> getAllValueHistory() {

        return propertyValueHistoryRepository.findAll();
    }

    public List<PropertyValueHistory> getValueHistoryByPropertyId(
            Long propertyId) {

        return propertyValueHistoryRepository
                .findByPropertyId(propertyId);
    }
}