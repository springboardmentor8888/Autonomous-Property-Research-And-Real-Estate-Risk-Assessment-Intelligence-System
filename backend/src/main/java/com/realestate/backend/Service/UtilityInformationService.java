package com.realestate.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.UtilityInformation;
import com.realestate.backend.Exception.UtilityInformationNotFoundException;
import com.realestate.backend.Repository.UtilityInformationRepository;

@Service
public class UtilityInformationService {

    private final UtilityInformationRepository utilityInformationRepository;

    public UtilityInformationService(
            UtilityInformationRepository utilityInformationRepository) {
        this.utilityInformationRepository = utilityInformationRepository;
    }

    public UtilityInformation createUtilityInformation(
            UtilityInformation utilityInformation) {

        return utilityInformationRepository.save(utilityInformation);
    }

    public List<UtilityInformation> getAllUtilityInformation() {

        return utilityInformationRepository.findAll();
    }

    public UtilityInformation getUtilityInformationById(Long id) {

        return utilityInformationRepository.findById(id)
                .orElseThrow(() ->
                        new UtilityInformationNotFoundException(
                                "Utility Information not found"));
    }

    public List<UtilityInformation> getUtilityInformationByPropertyId(
            Long propertyId) {

        return utilityInformationRepository
                .findByPropertyId(propertyId);
    }
}