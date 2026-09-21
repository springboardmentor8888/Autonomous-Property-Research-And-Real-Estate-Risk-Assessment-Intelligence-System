package com.realestate.backend.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.DueDiligence;
import com.realestate.backend.Exception.DueDiligenceAlreadyExistsException;
import com.realestate.backend.Exception.DueDiligenceNotFoundException;
import com.realestate.backend.Repository.DueDiligenceRepository;

@Service
public class DueDiligenceService {

    private final DueDiligenceRepository dueDiligenceRepository;

    public DueDiligenceService(DueDiligenceRepository dueDiligenceRepository) {
        this.dueDiligenceRepository = dueDiligenceRepository;
    }

    public DueDiligence createDueDiligence(DueDiligence dueDiligence) {

        if (dueDiligenceRepository
                .findByPropertyId(dueDiligence.getProperty().getId())
                .isPresent()) {

            throw new DueDiligenceAlreadyExistsException(
                    "Due Diligence already exists for this property");
        }

        dueDiligence.setStatus("PENDING");

        dueDiligence.setStartedAt(LocalDateTime.now());

        return dueDiligenceRepository.save(dueDiligence);
    }

    public List<DueDiligence> getAllDueDiligence() {
        return dueDiligenceRepository.findAll();
    }

    public DueDiligence getDueDiligenceById(Long id) {
        return dueDiligenceRepository.findById(id)
                .orElseThrow(() -> new DueDiligenceNotFoundException("Due Diligence not found"));
    }
    public DueDiligence getDueDiligenceByPropertyId(Long propertyId) {

        return dueDiligenceRepository.findByPropertyId(propertyId)
                .orElseThrow(() -> new DueDiligenceNotFoundException(
                        "Due Diligence not found for property: " + propertyId));
    }
    public DueDiligence completeDueDiligence(Long id) {

        DueDiligence dueDiligence =
                dueDiligenceRepository.findById(id)
                        .orElseThrow(() -> new DueDiligenceNotFoundException(
                                "Due Diligence not found with id: " + id));

        dueDiligence.setStatus("COMPLETED");
        dueDiligence.setCompletedAt(java.time.LocalDateTime.now());

        return dueDiligenceRepository.save(dueDiligence);
    }
}