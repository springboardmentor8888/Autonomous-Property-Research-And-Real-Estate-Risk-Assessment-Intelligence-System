package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermitValidationResponseDTO {
    private boolean valid;
    private String riskLevel;          // LOW, MEDIUM, HIGH
    private int totalPermits;
    private int openPermitsCount;
    private int expiredPermitsCount;
    private int violationsCount;
    private List<String> warnings;
    private List<String> actionItems;
    private String summary;
}
