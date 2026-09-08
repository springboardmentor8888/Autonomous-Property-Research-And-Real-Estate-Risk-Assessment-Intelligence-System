package com.realestate.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.ZoningInformation;
import com.realestate.backend.Exception.ZoningInformationNotFoundException;
import com.realestate.backend.Repository.ZoningInformationRepository;

@Service
public class ZoningInformationService {

    private final ZoningInformationRepository zoningInformationRepository;

    public ZoningInformationService(
            ZoningInformationRepository zoningInformationRepository) {
        this.zoningInformationRepository = zoningInformationRepository;
    }

    public ZoningInformation createZoningInformation(
            ZoningInformation zoningInformation) {

        return zoningInformationRepository.save(zoningInformation);
    }

    public List<ZoningInformation> getAllZoningInformation() {

        return zoningInformationRepository.findAll();
    }

    public ZoningInformation getZoningInformationById(Long id) {

        return zoningInformationRepository.findById(id)
                .orElseThrow(() ->
                        new ZoningInformationNotFoundException(
                                "Zoning Information not found"));
    }

    public List<ZoningInformation> getZoningInformationByPropertyId(
            Long propertyId) {

        return zoningInformationRepository
                .findByPropertyId(propertyId);
    }
}