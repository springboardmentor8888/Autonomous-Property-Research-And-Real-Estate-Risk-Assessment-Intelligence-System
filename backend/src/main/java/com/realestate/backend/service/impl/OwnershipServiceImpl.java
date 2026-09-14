package com.realestate.backend.service.impl;

import com.realestate.backend.entity.Ownership;
import com.realestate.backend.entity.Property;
import com.realestate.backend.repository.OwnershipRepository;
import com.realestate.backend.repository.PropertyRepository;
import com.realestate.backend.service.OwnershipService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OwnershipServiceImpl implements OwnershipService {

    private final OwnershipRepository ownershipRepository;
    private final PropertyRepository propertyRepository;

    public OwnershipServiceImpl(
            OwnershipRepository ownershipRepository,
            PropertyRepository propertyRepository) {
        this.ownershipRepository = ownershipRepository;
        this.propertyRepository = propertyRepository;
    }

    @Override
    public Ownership createOwnership(Ownership ownership) {

        if (ownership.getProperty() == null ||
                ownership.getProperty().getId() == null) {
            throw new RuntimeException("Property ID is required");
        }

        Long propertyId = ownership.getProperty().getId();

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException("Property not found with id: " + propertyId));

        ownership.setProperty(property);

        return ownershipRepository.save(ownership);
    }

    @Override
    public Ownership getOwnershipById(Long id) {
        return ownershipRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Ownership not found with id: " + id));
    }

    @Override
    public List<Ownership> getAllOwnerships() {
        return ownershipRepository.findAll();
    }

    @Override
    public Ownership updateOwnership(Long id, Ownership ownership) {

        Ownership existingOwnership = getOwnershipById(id);

        existingOwnership.setOwnerName(ownership.getOwnerName());
        existingOwnership.setOwnershipPercentage(
                ownership.getOwnershipPercentage()
        );
        existingOwnership.setStartDate(ownership.getStartDate());
        existingOwnership.setEndDate(ownership.getEndDate());

        return ownershipRepository.save(existingOwnership);
    }

    @Override
    public void deleteOwnership(Long id) {

        Ownership ownership = getOwnershipById(id);

        ownershipRepository.delete(ownership);
    }

    @Override
    public List<Ownership> getOwnershipsByPropertyId(Long propertyId) {

        return ownershipRepository.findAll()
                .stream()
                .filter(ownership ->
                        ownership.getProperty() != null
                                && ownership.getProperty().getId().equals(propertyId))
                .toList();
    }
}