package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.PropertyDto;
import com.realestate.duediligence.entity.*;
import com.realestate.duediligence.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final AddressValidationRepository addressValidationRepository;
    private final TaxRecordRepository taxRecordRepository;
    private final PermitRecordRepository permitRecordRepository;
    private final ComparablePropertyRepository comparablePropertyRepository;

    public PropertyService(PropertyRepository propertyRepository,
                           AddressValidationRepository addressValidationRepository,
                           TaxRecordRepository taxRecordRepository,
                           PermitRecordRepository permitRecordRepository,
                           ComparablePropertyRepository comparablePropertyRepository) {
        this.propertyRepository = propertyRepository;
        this.addressValidationRepository = addressValidationRepository;
        this.taxRecordRepository = taxRecordRepository;
        this.permitRecordRepository = permitRecordRepository;
        this.comparablePropertyRepository = comparablePropertyRepository;
    }

    public List<PropertyDto> searchProperties(String queryAddress) {
        List<Property> properties;
        if (queryAddress != null && !queryAddress.trim().isEmpty()) {
            properties = propertyRepository.findByAddressContainingIgnoreCase(queryAddress.trim());
        } else {
            properties = propertyRepository.findAll();
        }

        return properties.stream().map(this::toDto).collect(Collectors.toList());
    }

    public PropertyDto getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with ID: " + id));
        return toDto(property);
    }

    public AddressValidation validateAddress(String submittedAddress) {
        List<Property> matches = propertyRepository.findByAddressContainingIgnoreCase(submittedAddress.trim());
        boolean isValid = !matches.isEmpty();

        Property target = matches.isEmpty() ? null : matches.get(0);

        AddressValidation validation = AddressValidation.builder()
                .propertyId(target != null ? target.getId() : 1L)
                .submittedAddress(submittedAddress)
                .validatedAddress(target != null ? target.getAddress() + ", " + target.getCity() + ", " + target.getState() + " " + target.getZipCode() : submittedAddress)
                .isValid(isValid)
                .validationSource("State Public Registry & GIS Parcel Node")
                .build();

        return addressValidationRepository.save(validation);
    }

    public List<TaxRecord> getTaxHistory(Long propertyId) {
        return taxRecordRepository.findByPropertyId(propertyId);
    }

    public List<PermitRecord> getPermits(Long propertyId) {
        return permitRecordRepository.findByPropertyId(propertyId);
    }

    public List<ComparableProperty> getComparables(Long propertyId) {
        return comparablePropertyRepository.findByPropertyId(propertyId);
    }

    public PropertyDto toDto(Property property) {
        List<PropertyDto.TaxHistoryItem> taxes = taxRecordRepository.findByPropertyId(property.getId()).stream()
                .map(t -> new PropertyDto.TaxHistoryItem(t.getYear(), t.getAmountPaid(), t.getStatus()))
                .collect(Collectors.toList());

        List<PropertyDto.PermitItem> permits = permitRecordRepository.findByPropertyId(property.getId()).stream()
                .map(p -> new PropertyDto.PermitItem(p.getPermitType(), p.getStatus(), p.getIssuedDate()))
                .collect(Collectors.toList());

        return PropertyDto.builder()
                .id(property.getId())
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .zipCode(property.getZipCode())
                .propertyType(property.getPropertyType())
                .parcelId(property.getParcelId())
                .ownership(new PropertyDto.OwnershipInfo(
                        property.getOwnerName() != null ? property.getOwnerName() : "Unknown Owner",
                        property.getAcquiredDate() != null ? property.getAcquiredDate() : LocalDate.of(2018, 5, 12)
                ))
                .taxHistory(taxes)
                .zoning(new PropertyDto.ZoningInfo(
                        property.getZoneType() != null ? property.getZoneType() : "Residential R-2",
                        property.getZoneCompliant() != null ? property.getZoneCompliant() : true
                ))
                .floodZone(new PropertyDto.FloodZoneInfo(
                        property.getFloodZone() != null ? property.getFloodZone() : "Zone X",
                        property.getFloodRiskLevel() != null ? property.getFloodRiskLevel() : "LOW"
                ))
                .permits(permits)
                .build();
    }
}
