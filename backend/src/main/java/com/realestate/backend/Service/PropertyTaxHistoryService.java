package com.realestate.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.PropertyTaxHistory;
import com.realestate.backend.Repository.PropertyTaxHistoryRepository;

@Service
public class PropertyTaxHistoryService {

    private final PropertyTaxHistoryRepository propertyTaxHistoryRepository;

    public PropertyTaxHistoryService(
            PropertyTaxHistoryRepository propertyTaxHistoryRepository) {
        this.propertyTaxHistoryRepository = propertyTaxHistoryRepository;
    }

    public PropertyTaxHistory createTaxHistory(
            PropertyTaxHistory taxHistory) {
        return propertyTaxHistoryRepository.save(taxHistory);
    }

    public List<PropertyTaxHistory> getAllTaxHistory() {
        return propertyTaxHistoryRepository.findAll();
    }

    public PropertyTaxHistory getTaxHistoryById(Long id) {
        return propertyTaxHistoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Property Tax History not found"));
    }

    public List<PropertyTaxHistory> getTaxHistoryByPropertyId(
            Long propertyId) {
        return propertyTaxHistoryRepository.findByPropertyId(propertyId);
    }
    public PropertyTaxHistory updateTaxHistory(
            Long id,
            PropertyTaxHistory taxHistory) {

        PropertyTaxHistory existing =
                propertyTaxHistoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Property Tax History not found"));

        existing.setProperty(taxHistory.getProperty());
        existing.setTaxYear(taxHistory.getTaxYear());
        existing.setTaxAmount(taxHistory.getTaxAmount());
        existing.setPaymentStatus(taxHistory.getPaymentStatus());
        existing.setPaymentDate(taxHistory.getPaymentDate());
        existing.setNotes(taxHistory.getNotes());

        return propertyTaxHistoryRepository.save(existing);
    }
}