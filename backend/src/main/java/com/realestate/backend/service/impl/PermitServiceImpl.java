package com.realestate.backend.service.impl;

import com.realestate.backend.entity.Permit;
import com.realestate.backend.entity.Property;
import com.realestate.backend.repository.PermitRepository;
import com.realestate.backend.repository.PropertyRepository;
import com.realestate.backend.service.PermitService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PermitServiceImpl implements PermitService {

    private final PermitRepository permitRepository;
    private final PropertyRepository propertyRepository;

    public PermitServiceImpl(
            PermitRepository permitRepository,
            PropertyRepository propertyRepository) {
        this.permitRepository = permitRepository;
        this.propertyRepository = propertyRepository;
    }

    @Override
    public Permit createPermit(Long propertyId, Permit permit) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException("Property not found with id: " + propertyId));

        permit.setProperty(property);

        if (permit.getStatus() == null || permit.getStatus().isBlank()) {
            permit.setStatus("ACTIVE");
        }

        return permitRepository.save(permit);
    }

    @Override
    public List<Permit> getAllPermits() {
        return permitRepository.findAll();
    }

    @Override
    public Permit getPermitById(Long id) {
        return permitRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Permit not found with id: " + id));
    }

    @Override
    public List<Permit> getPermitsByPropertyId(Long propertyId) {
        return permitRepository.findByPropertyId(propertyId);
    }

    @Override
    public Permit updatePermit(Long id, Permit updatedPermit) {

        Permit existingPermit = permitRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Permit not found with id: " + id));

        existingPermit.setPermitNumber(updatedPermit.getPermitNumber());
        existingPermit.setPermitType(updatedPermit.getPermitType());
        existingPermit.setIssuingAuthority(updatedPermit.getIssuingAuthority());
        existingPermit.setIssueDate(updatedPermit.getIssueDate());
        existingPermit.setExpiryDate(updatedPermit.getExpiryDate());
        existingPermit.setStatus(updatedPermit.getStatus());
        existingPermit.setDescription(updatedPermit.getDescription());

        return permitRepository.save(existingPermit);
    }

    @Override
    public void deletePermit(Long id) {

        if (!permitRepository.existsById(id)) {
            throw new RuntimeException("Permit not found with id: " + id);
        }

        permitRepository.deleteById(id);
    }
}