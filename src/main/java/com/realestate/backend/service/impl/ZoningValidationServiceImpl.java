package com.realestate.backend.service.impl;

import com.realestate.backend.dto.ZoningInfoDTO;
import com.realestate.backend.dto.ZoningValidationResponseDTO;
import com.realestate.backend.service.ZoningValidationService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ZoningValidationServiceImpl implements ZoningValidationService {

    @Override
    public ZoningValidationResponseDTO validateZoning(ZoningInfoDTO zoningInfo, String propertyType) {
        if (zoningInfo == null || zoningInfo.getZoneType() == null) {
            return ZoningValidationResponseDTO.builder()
                    .valid(false)
                    .compliant(false)
                    .zoneType("UNKNOWN")
                    .riskLevel("HIGH")
                    .violations(List.of("Missing municipal zoning classification."))
                    .warnings(List.of("Unable to confirm permitted property usage."))
                    .summary("Zoning verification failed: No record found.")
                    .build();
        }

        String zone = zoningInfo.getZoneType().toUpperCase().trim();
        String type = propertyType != null ? propertyType.toUpperCase().trim() : "UNKNOWN";
        List<String> violations = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        boolean compliant = true;

        // Validation rules:
        // Residential zone starting with R (e.g., R-1, R-2)
        if (zone.startsWith("R")) {
            if (type.contains("COMMERCIAL") || type.contains("INDUSTRIAL")) {
                compliant = false;
                violations.add("Incompatible land use: " + type + " usage is prohibited in residential zone " + zone + ".");
            }
        } else if (zone.startsWith("C")) {
            // Commercial zone
            if (type.contains("INDUSTRIAL")) {
                compliant = false;
                violations.add("Heavy industrial operations prohibited in commercial district " + zone + ".");
            }
        } else if (zone.startsWith("M") || zone.startsWith("I")) {
            // Industrial
            if (type.contains("RESIDENTIAL") || type.contains("SINGLE_FAMILY")) {
                warnings.add("Residential dwelling situated in industrial zone " + zone + "; potential environmental and nuisance risks.");
            }
        }

        if (zoningInfo.getCompliant() != null && !zoningInfo.getCompliant()) {
            compliant = false;
            violations.add("Municipal records flag non-conforming or unpermitted structure variance.");
        }

        String riskLevel;
        if (!violations.isEmpty()) {
            riskLevel = "HIGH";
        } else if (!warnings.isEmpty()) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        String summary = compliant
                ? "Zoning Compliant: Property usage matches municipal classification (" + zone + ")."
                : "Zoning Violation: Property violates zoning ordinances for " + zone + ".";

        return ZoningValidationResponseDTO.builder()
                .valid(true)
                .compliant(compliant)
                .zoneType(zone)
                .riskLevel(riskLevel)
                .violations(violations)
                .warnings(warnings)
                .summary(summary)
                .build();
    }
}
