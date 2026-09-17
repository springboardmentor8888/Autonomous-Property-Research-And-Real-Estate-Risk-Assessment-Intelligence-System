package com.realestate.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.RiskAssessment;
import com.realestate.backend.Exception.RiskAssessmentNotFoundException;
import com.realestate.backend.Repository.BuildingPermitRecordRepository;
import com.realestate.backend.Repository.FloodZoneVerificationRepository;
import com.realestate.backend.Repository.OwnershipRecordRepository;
import com.realestate.backend.Repository.PropertyTaxHistoryRepository;
import com.realestate.backend.Repository.RiskAssessmentRepository;
import com.realestate.backend.Repository.ZoningInformationRepository;

@Service
public class RiskAssessmentService {

	private final RiskAssessmentRepository riskAssessmentRepository;
	private final OwnershipRecordRepository ownershipRecordRepository;
	private final PropertyTaxHistoryRepository propertyTaxHistoryRepository;
	private final BuildingPermitRecordRepository buildingPermitRecordRepository;
	private final ZoningInformationRepository zoningInformationRepository;
	private final FloodZoneVerificationRepository floodZoneVerificationRepository;

	public RiskAssessmentService(RiskAssessmentRepository riskAssessmentRepository,
			OwnershipRecordRepository ownershipRecordRepository,
			PropertyTaxHistoryRepository propertyTaxHistoryRepository,
			BuildingPermitRecordRepository buildingPermitRecordRepository,
			ZoningInformationRepository zoningInformationRepository,
			FloodZoneVerificationRepository floodZoneVerificationRepository) {

		this.riskAssessmentRepository = riskAssessmentRepository;
		this.ownershipRecordRepository = ownershipRecordRepository;
		this.propertyTaxHistoryRepository = propertyTaxHistoryRepository;
		this.buildingPermitRecordRepository = buildingPermitRecordRepository;
		this.zoningInformationRepository = zoningInformationRepository;
		this.floodZoneVerificationRepository = floodZoneVerificationRepository;
	}

	public RiskAssessment createRiskAssessment(RiskAssessment riskAssessment) {

		Long propertyId = riskAssessment.getProperty().getId();

		RiskAssessment existing = riskAssessmentRepository.findByPropertyId(propertyId).orElse(null);

		if (existing != null) {

			existing.setTaxRisk(calculateTaxRisk(propertyId));
			existing.setFloodRisk(calculateFloodRisk(propertyId));
			existing.setPermitRisk(calculatePermitRisk(propertyId));
			existing.setZoningRisk(calculateZoningRisk(propertyId));
			existing.setOwnershipRisk(calculateOwnershipRisk(propertyId));
			existing.setLegalRisk(calculateLegalRisk(propertyId));
			existing.setRiskScore(calculateRiskScore(existing));
			existing.setOverallRisk(
			        calculateOverallRisk(existing.getRiskScore()));
			existing.setSummary(
			        generateSummary(existing.getOverallRisk()));
			return riskAssessmentRepository.save(existing);
		}

		riskAssessment.setTaxRisk(calculateTaxRisk(propertyId));
		riskAssessment.setFloodRisk(calculateFloodRisk(propertyId));
		riskAssessment.setPermitRisk(calculatePermitRisk(propertyId));
		riskAssessment.setZoningRisk(calculateZoningRisk(propertyId));
		riskAssessment.setOwnershipRisk(calculateOwnershipRisk(propertyId));
		riskAssessment.setLegalRisk(calculateLegalRisk(propertyId));
		riskAssessment.setRiskScore(calculateRiskScore(riskAssessment));
		riskAssessment.setOverallRisk(
		        calculateOverallRisk(riskAssessment.getRiskScore()));
		riskAssessment.setSummary(
		        generateSummary(riskAssessment.getOverallRisk()));
		return riskAssessmentRepository.save(riskAssessment);
	}

	public List<RiskAssessment> getAllRiskAssessments() {

		return riskAssessmentRepository.findAll();
	}

	public RiskAssessment getRiskAssessmentById(Long id) {

		return riskAssessmentRepository.findById(id)
				.orElseThrow(() -> new RiskAssessmentNotFoundException("Risk assessment not found"));
	}

	public RiskAssessment getRiskAssessmentByPropertyId(Long propertyId) {

		return riskAssessmentRepository.findByPropertyId(propertyId)
				.orElseThrow(() -> new RuntimeException("Risk assessment not found for property"));
	}

	private String calculateTaxRisk(Long propertyId) {

		var taxRecords = propertyTaxHistoryRepository.findByPropertyId(propertyId);

		if (taxRecords.isEmpty()) {
			return "UNKNOWN";
		}

		for (var tax : taxRecords) {

			if ("UNPAID".equalsIgnoreCase(tax.getPaymentStatus())) {
				return "HIGH";
			}
		}

		return "LOW";
	}

	private String calculateFloodRisk(Long propertyId) {

		var floodRecords = floodZoneVerificationRepository.findByPropertyId(propertyId);

		if (floodRecords.isEmpty()) {
			return "UNKNOWN";
		}

		for (var flood : floodRecords) {

			if ("HIGH".equalsIgnoreCase(flood.getRiskLevel())) {
				return "HIGH";
			}

			if ("MEDIUM".equalsIgnoreCase(flood.getRiskLevel())) {
				return "MEDIUM";
			}
		}

		return "LOW";
	}

	private String calculatePermitRisk(Long propertyId) {

		var permitRecords = buildingPermitRecordRepository.findByPropertyId(propertyId);

		if (permitRecords.isEmpty()) {
			return "UNKNOWN";
		}

		for (var permit : permitRecords) {

			if ("EXPIRED".equalsIgnoreCase(permit.getStatus())) {
				return "HIGH";
			}

			if ("PENDING".equalsIgnoreCase(permit.getStatus())) {
				return "MEDIUM";
			}
		}

		return "LOW";
	}

	private String calculateZoningRisk(Long propertyId) {

		var zoningRecords = zoningInformationRepository.findByPropertyId(propertyId);

		if (zoningRecords.isEmpty()) {
			return "UNKNOWN";
		}

		for (var zoning : zoningRecords) {

			if ("NON_COMPLIANT".equalsIgnoreCase(zoning.getStatus())) {
				return "HIGH";
			}

			if ("PENDING".equalsIgnoreCase(zoning.getStatus())) {
				return "MEDIUM";
			}
		}

		return "LOW";
	}

	private String calculateOwnershipRisk(Long propertyId) {

	    var ownershipRecords =
	            ownershipRecordRepository.findByPropertyId(propertyId);

	    if (ownershipRecords.isEmpty()) {
	        return "UNKNOWN";
	    }

	    for (var ownership : ownershipRecords) {

	        if (!Boolean.TRUE.equals(ownership.getVerified())) {
	            return "HIGH";
	        }
	    }

	    return "LOW";
	}
	private String calculateLegalRisk(Long propertyId) {

	    var ownershipRecords =
	            ownershipRecordRepository.findByPropertyId(propertyId);

	    if (ownershipRecords.isEmpty()) {
	        return "UNKNOWN";
	    }

	    for (var ownership : ownershipRecords) {

	        if (!Boolean.TRUE.equals(ownership.getVerified())) {
	            return "HIGH";
	        }

	        if (ownership.getDocumentReference() == null
	                || ownership.getDocumentReference().trim().isEmpty()) {
	            return "HIGH";
	        }
	    }

	    return "LOW";
	}
	private int calculateRiskScore(RiskAssessment riskAssessment) {

	    return calculateRiskPoints(riskAssessment.getLegalRisk())
	            + calculateRiskPoints(riskAssessment.getTaxRisk())
	            + calculateRiskPoints(riskAssessment.getFloodRisk())
	            + calculateRiskPoints(riskAssessment.getPermitRisk())
	            + calculateRiskPoints(riskAssessment.getZoningRisk())
	            + calculateRiskPoints(riskAssessment.getOwnershipRisk());
	}
	private int calculateRiskPoints(String risk) {

	    if ("HIGH".equalsIgnoreCase(risk)) {
	        return 20;
	    }

	    if ("MEDIUM".equalsIgnoreCase(risk)) {
	        return 10;
	    }

	    if ("UNKNOWN".equalsIgnoreCase(risk)) {
	        return 5;
	    }

	    return 0;
	}
	private String calculateOverallRisk(int riskScore) {

	    if (riskScore <= 20) {
	        return "LOW";
	    }

	    if (riskScore <= 60) {
	        return "MEDIUM";
	    }

	    return "HIGH";
	}
	private String generateSummary(String overallRisk) {

	    return "Property has " 
	            + overallRisk.toLowerCase()
	            + " overall risk based on current due diligence information.";
	}
}
