package com.realestate.backend.service.impl;

import com.realestate.backend.dto.FloodValidationResponseDTO;
import com.realestate.backend.dto.FloodZoneDTO;
import com.realestate.backend.service.FloodValidationService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FloodValidationServiceImpl implements FloodValidationService {

    @Override
    public FloodValidationResponseDTO validateFloodZone(FloodZoneDTO floodZone) {
        if (floodZone == null || floodZone.getZone() == null) {
            return FloodValidationResponseDTO.builder()
                    .valid(false)
                    .zone("UNKNOWN")
                    .riskLevel("HIGH")
                    .mandatoryFloodInsurance(false)
                    .warnings(List.of("No FEMA flood map data available. Manual flood elevation certificate requested."))
                    .advisoryNotice("Unable to verify flood hazard status. Mortgage approval may be delayed.")
                    .build();
        }

        String rawZone = floodZone.getZone().toUpperCase().trim();
        List<String> warnings = new ArrayList<>();
        String riskLevel;
        boolean insuranceRequired;

        // FEMA Zones:
        // High Risk (Special Flood Hazard Area): A, AE, AH, AO, AR, A99, V, VE
        // Moderate: B, X (shaded), 500-year
        // Low: C, X (unshaded)
        if (rawZone.startsWith("V") || rawZone.startsWith("VE")) {
            riskLevel = "HIGH";
            insuranceRequired = true;
            warnings.add("Coastal high-hazard area (Velocity zone). Severe storm surge risk.");
            warnings.add("Mandatory flood insurance required by all federally-backed lenders.");
        } else if (rawZone.startsWith("A") || rawZone.startsWith("AE") || rawZone.startsWith("AO") || rawZone.startsWith("AH")) {
            riskLevel = "HIGH";
            insuranceRequired = true;
            warnings.add("100-year floodplain (1% annual chance of inundation).");
            warnings.add("Mandatory FEMA flood insurance policy required before loan origination.");
        } else if (rawZone.contains("SHADED") || rawZone.equals("B")) {
            riskLevel = "MEDIUM";
            insuranceRequired = false;
            warnings.add("500-year flood zone (0.2% annual chance). Flood insurance strongly recommended.");
        } else {
            riskLevel = "LOW";
            insuranceRequired = false;
        }

        String advisory = insuranceRequired
                ? "HIGH FLOOD HAZARD: National Flood Insurance Program (NFIP) policy mandatory."
                : "MINIMAL FLOOD HAZARD: Standard homeowner policy coverage suffices; flood insurance optional.";

        return FloodValidationResponseDTO.builder()
                .valid(true)
                .zone(rawZone)
                .riskLevel(riskLevel)
                .mandatoryFloodInsurance(insuranceRequired)
                .warnings(warnings)
                .advisoryNotice(advisory)
                .build();
    }
}
