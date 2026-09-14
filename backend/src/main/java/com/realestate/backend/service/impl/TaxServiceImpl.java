package com.realestate.backend.service.impl;

import com.realestate.backend.entity.Property;
import com.realestate.backend.entity.Tax;
import com.realestate.backend.repository.PropertyRepository;
import com.realestate.backend.repository.TaxRepository;
import com.realestate.backend.service.TaxService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaxServiceImpl implements TaxService {

    private final TaxRepository taxRepository;
    private final PropertyRepository propertyRepository;

    public TaxServiceImpl(TaxRepository taxRepository, PropertyRepository propertyRepository) {
        this.taxRepository = taxRepository;
        this.propertyRepository = propertyRepository;
    }

    @Override
    public Tax createTax(Long propertyId, Tax tax) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        tax.setProperty(property);

        return taxRepository.save(tax);
    }

    @Override
    public List<Tax> getAllTaxes() {
        return taxRepository.findAll();
    }

    @Override
    public Tax getTaxById(Long id) {
        return taxRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tax record not found"));
    }

    @Override
    public List<Tax> getTaxesByPropertyId(Long propertyId) {
        return taxRepository.findByPropertyId(propertyId);
    }

    @Override
    public Tax updateTax(Long id, Tax updatedTax) {
        Tax existingTax = taxRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tax record not found"));

        existingTax.setTaxYear(updatedTax.getTaxYear());
        existingTax.setTaxAmount(updatedTax.getTaxAmount());
        existingTax.setDueDate(updatedTax.getDueDate());
        existingTax.setStatus(updatedTax.getStatus());
        existingTax.setDescription(updatedTax.getDescription());

        return taxRepository.save(existingTax);
    }

    @Override
    public void deleteTax(Long id) {
        Tax existingTax = taxRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tax record not found"));

        taxRepository.delete(existingTax);
    }
}