package com.realestate.backend.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.dto.RiskAssessmentResponseDTO;
import com.realestate.backend.entity.FloodStorage;
import com.realestate.backend.entity.Ownership;
import com.realestate.backend.entity.Permit;
import com.realestate.backend.entity.Tax;
import com.realestate.backend.entity.Zoning;
import com.realestate.backend.repository.FloodStorageRepository;
import com.realestate.backend.repository.OwnershipRepository;
import com.realestate.backend.repository.PermitRepository;
import com.realestate.backend.repository.TaxRepository;
import com.realestate.backend.repository.ZoningRepository;
import com.realestate.backend.service.RiskEngineService;

@Service
public class RiskEngineServiceImpl implements RiskEngineService {

    private final OwnershipRepository ownershipRepository;
    private final TaxRepository taxRepository;
    private final FloodStorageRepository floodStorageRepository;
    private final PermitRepository permitRepository;
    private final ZoningRepository zoningRepository;

    public RiskEngineServiceImpl(
            OwnershipRepository ownershipRepository,
            TaxRepository taxRepository,
            FloodStorageRepository floodStorageRepository,
            PermitRepository permitRepository,
            ZoningRepository zoningRepository) {

        this.ownershipRepository = ownershipRepository;
        this.taxRepository = taxRepository;
        this.floodStorageRepository = floodStorageRepository;
        this.permitRepository = permitRepository;
        this.zoningRepository = zoningRepository;
    }

    @Override
    public RiskAssessmentResponseDTO assessRisk(Long propertyId) {

        List<Ownership> ownershipRecords =
                ownershipRepository.findByPropertyId(propertyId);

        if (ownershipRecords.isEmpty()) {
            return new RiskAssessmentResponseDTO(
                    propertyId,
                    "HIGH",
                    "OWNERSHIP_RISK",
                    "No ownership records found for the property."
            );
        }

        BigDecimal totalOwnership = ownershipRecords.stream()
                .map(Ownership::getOwnershipPercentage)
                .filter(percentage -> percentage != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalOwnership.compareTo(new BigDecimal("100.00")) != 0) {
            return new RiskAssessmentResponseDTO(
                    propertyId,
                    "HIGH",
                    "OWNERSHIP_RISK",
                    "Ownership verification failed. Total ownership is "
                            + totalOwnership + "% instead of 100%."
            );
        }

        List<Tax> taxRecords =
                taxRepository.findByPropertyId(propertyId);

        if (taxRecords.isEmpty()) {
            return new RiskAssessmentResponseDTO(
                    propertyId,
                    "HIGH",
                    "TAX_RISK",
                    "No tax records found for the property."
            );
        }

        boolean pendingTaxExists = taxRecords.stream()
                .anyMatch(tax ->
                        tax.getStatus() == null
                                || !tax.getStatus().equalsIgnoreCase("PAID"));

        if (pendingTaxExists) {
            return new RiskAssessmentResponseDTO(
                    propertyId,
                    "HIGH",
                    "TAX_RISK",
                    "Tax risk detected. One or more tax records are not paid."
            );
        }

        List<FloodStorage> floodRecords =
                floodStorageRepository.findByPropertyId(propertyId);

        if (floodRecords.isEmpty()) {
            return new RiskAssessmentResponseDTO(
                    propertyId,
                    "HIGH",
                    "FLOOD_RISK",
                    "No flood risk records found for the property."
            );
        }

        boolean highFloodRiskExists = floodRecords.stream()
                .anyMatch(flood ->
                        flood.getRiskLevel() != null
                                && flood.getRiskLevel().equalsIgnoreCase("HIGH"));

        if (highFloodRiskExists) {
            return new RiskAssessmentResponseDTO(
                    propertyId,
                    "HIGH",
                    "FLOOD_RISK",
                    "Flood risk detected. The property has a high flood risk level."
            );
        }

        List<Permit> permitRecords =
                permitRepository.findByPropertyId(propertyId);

        if (permitRecords.isEmpty()) {
            return new RiskAssessmentResponseDTO(
                    propertyId,
                    "HIGH",
                    "PERMIT_RISK",
                    "No permit records found for the property."
            );
        }

        LocalDate today = LocalDate.now();

        boolean invalidPermitExists = permitRecords.stream()
                .anyMatch(permit ->
                        permit.getStatus() == null
                                || !permit.getStatus().equalsIgnoreCase("ACTIVE")
                                || permit.getExpiryDate() == null
                                || permit.getExpiryDate().isBefore(today));

        if (invalidPermitExists) {
            return new RiskAssessmentResponseDTO(
                    propertyId,
                    "HIGH",
                    "PERMIT_RISK",
                    "Permit risk detected. One or more permits are inactive or expired."
            );
        }

        List<Zoning> zoningRecords =
                zoningRepository.findByPropertyId(propertyId);

        if (zoningRecords.isEmpty()) {
            return new RiskAssessmentResponseDTO(
                    propertyId,
                    "HIGH",
                    "ZONING_RISK",
                    "No zoning records found for the property."
            );
        }

        boolean inactiveZoningExists = zoningRecords.stream()
                .anyMatch(zoning ->
                        zoning.getStatus() == null
                                || !zoning.getStatus().equalsIgnoreCase("ACTIVE"));

        if (inactiveZoningExists) {
            return new RiskAssessmentResponseDTO(
                    propertyId,
                    "HIGH",
                    "ZONING_RISK",
                    "Zoning risk detected. One or more zoning records are inactive."
            );
        }

        return new RiskAssessmentResponseDTO(
                propertyId,
                "LOW",
                "RISK_ASSESSMENT_PASSED",
                "Ownership is verified, all tax records are paid, no high flood risk was detected, all permits are valid, and all zoning records are active."
        );
    }
}