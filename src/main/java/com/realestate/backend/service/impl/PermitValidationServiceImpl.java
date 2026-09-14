package com.realestate.backend.service.impl;

import com.realestate.backend.dto.PermitRecordDTO;
import com.realestate.backend.dto.PermitValidationResponseDTO;
import com.realestate.backend.service.PermitValidationService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PermitValidationServiceImpl implements PermitValidationService {

    @Override
    public PermitValidationResponseDTO validatePermits(List<PermitRecordDTO> permits) {
        if (permits == null || permits.isEmpty()) {
            return PermitValidationResponseDTO.builder()
                    .valid(true)
                    .riskLevel("LOW")
                    .totalPermits(0)
                    .openPermitsCount(0)
                    .expiredPermitsCount(0)
                    .violationsCount(0)
                    .warnings(List.of("No municipal permit history on record. Recommend on-site visual inspection."))
                    .actionItems(List.of("Verify with local building department if recent renovations required unfiled permits."))
                    .summary("Clean permit history: No open or expired records recorded.")
                    .build();
        }

        int openCount = 0;
        int expiredCount = 0;
        int violationCount = 0;
        List<String> warnings = new ArrayList<>();
        List<String> actionItems = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (PermitRecordDTO p : permits) {
            String status = p.getStatus() != null ? p.getStatus().toUpperCase().trim() : "UNKNOWN";
            String type = p.getPermitType() != null ? p.getPermitType().toUpperCase() : "GENERAL";
            String pNum = p.getPermitNumber() != null ? p.getPermitNumber() : "N/A";

            if ("OPEN".equals(status) || "UNDER_REVIEW".equals(status)) {
                openCount++;
                warnings.add("Open " + type + " permit (#" + pNum + ") has not received final city inspection approval.");
                actionItems.add("Require seller to obtain final Certificate of Occupancy / Completion for permit #" + pNum + " prior to closing.");
            } else if ("EXPIRED".equals(status)) {
                expiredCount++;
                warnings.add("Expired " + type + " permit (#" + pNum + ") found. Work may remain uncertified.");
                actionItems.add("Request municipality permit renewal or retroactive sign-off for permit #" + pNum + ".");
            } else if ("REVOKED".equals(status) || "VIOLATION".equals(status)) {
                violationCount++;
                warnings.add("CRITICAL: Building code violation or revoked permit detected on #" + pNum + " (" + type + ").");
                actionItems.add("Immediate legal and municipal review required before proceeding with transaction.");
            } else if (p.getExpirationDate() != null && p.getExpirationDate().isBefore(today) && !"CLOSED".equals(status)) {
                expiredCount++;
                warnings.add("Permit #" + pNum + " passed its expiration date (" + p.getExpirationDate() + ") without being closed.");
            }
        }

        // Determine Risk Level
        String riskLevel;
        boolean isValid;
        if (violationCount > 0 || expiredCount >= 2 || (openCount >= 2)) {
            riskLevel = "HIGH";
            isValid = false;
        } else if (openCount > 0 || expiredCount > 0) {
            riskLevel = "MEDIUM";
            isValid = true;
        } else {
            riskLevel = "LOW";
            isValid = true;
        }

        String summary = String.format(
                "Permit Review Complete: %d total permits analyzed (%d open, %d expired, %d violations). Risk Level: %s.",
                permits.size(), openCount, expiredCount, violationCount, riskLevel
        );

        return PermitValidationResponseDTO.builder()
                .valid(isValid)
                .riskLevel(riskLevel)
                .totalPermits(permits.size())
                .openPermitsCount(openCount)
                .expiredPermitsCount(expiredCount)
                .violationsCount(violationCount)
                .warnings(warnings)
                .actionItems(actionItems)
                .summary(summary)
                .build();
    }
}
