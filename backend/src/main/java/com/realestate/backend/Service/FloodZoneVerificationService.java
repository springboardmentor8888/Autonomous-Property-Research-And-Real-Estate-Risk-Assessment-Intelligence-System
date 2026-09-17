package com.realestate.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.FloodZoneVerification;
import com.realestate.backend.Exception.FloodZoneVerificationNotFoundException;
import com.realestate.backend.Repository.FloodZoneVerificationRepository;

@Service
public class FloodZoneVerificationService {

    private final FloodZoneVerificationRepository floodZoneVerificationRepository;

    public FloodZoneVerificationService(
            FloodZoneVerificationRepository floodZoneVerificationRepository) {
        this.floodZoneVerificationRepository = floodZoneVerificationRepository;
    }

    public FloodZoneVerification createFloodZoneVerification(
            FloodZoneVerification floodZoneVerification) {

        return floodZoneVerificationRepository.save(floodZoneVerification);
    }

    public List<FloodZoneVerification> getAllFloodZoneVerifications() {

        return floodZoneVerificationRepository.findAll();
    }

    public FloodZoneVerification getFloodZoneVerificationById(Long id) {

        return floodZoneVerificationRepository.findById(id)
                .orElseThrow(() ->
                        new FloodZoneVerificationNotFoundException(
                                "Flood Zone Verification not found"));
    }

    public List<FloodZoneVerification> getFloodZoneVerificationsByPropertyId(
            Long propertyId) {

        return floodZoneVerificationRepository
                .findByPropertyId(propertyId);
    }
    public FloodZoneVerification updateFloodZoneVerification(
            Long id,
            FloodZoneVerification floodZoneVerification) {

        FloodZoneVerification existing =
                floodZoneVerificationRepository.findById(id)
                        .orElseThrow(() ->
                                new FloodZoneVerificationNotFoundException(
                                        "Flood Zone Verification not found"));

        existing.setProperty(floodZoneVerification.getProperty());
        existing.setFloodZone(floodZoneVerification.getFloodZone());
        existing.setRiskLevel(floodZoneVerification.getRiskLevel());
        existing.setStatus(floodZoneVerification.getStatus());
        existing.setVerificationDate(
                floodZoneVerification.getVerificationDate());
        existing.setDescription(floodZoneVerification.getDescription());

        return floodZoneVerificationRepository.save(existing);
    }
}