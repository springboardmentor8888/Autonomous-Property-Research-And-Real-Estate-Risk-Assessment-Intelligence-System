package com.realestate.backend.service.impl;

import com.realestate.backend.entity.Property;
import com.realestate.backend.entity.Zoning;
import com.realestate.backend.repository.PropertyRepository;
import com.realestate.backend.repository.ZoningRepository;
import com.realestate.backend.service.ZoningService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ZoningServiceImpl implements ZoningService {

private final ZoningRepository zoningRepository;
private final PropertyRepository propertyRepository;

public ZoningServiceImpl(
        ZoningRepository zoningRepository,
        PropertyRepository propertyRepository) {
    this.zoningRepository = zoningRepository;
    this.propertyRepository = propertyRepository;
}

@Override
public Zoning createZoning(Long propertyId, Zoning zoning) {

    Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Property not found with id: " + propertyId));

    zoning.setProperty(property);

    return zoningRepository.save(zoning);
}

@Override
public List<Zoning> getAllZonings() {
    return zoningRepository.findAll();
}

@Override
public Zoning getZoningById(Long id) {

    return zoningRepository.findById(id)
            .orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Zoning not found with id: " + id));
}

@Override
public List<Zoning> getZoningsByPropertyId(Long propertyId) {
    return zoningRepository.findByPropertyId(propertyId);
}

@Override
public Zoning updateZoning(Long id, Zoning zoning) {

    Zoning existingZoning = getZoningById(id);

    existingZoning.setZoningCode(zoning.getZoningCode());
    existingZoning.setZoningType(zoning.getZoningType());
    existingZoning.setAllowedUse(zoning.getAllowedUse());
    existingZoning.setRestrictions(zoning.getRestrictions());
    existingZoning.setEffectiveDate(zoning.getEffectiveDate());
    existingZoning.setStatus(zoning.getStatus());

    return zoningRepository.save(existingZoning);
}

@Override
public void deleteZoning(Long id) {

    Zoning zoning = getZoningById(id);

    zoningRepository.delete(zoning);
}

}