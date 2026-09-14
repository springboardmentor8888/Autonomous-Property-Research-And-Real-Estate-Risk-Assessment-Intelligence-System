package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermitRecordDTO {
    private String permitNumber;
    private String permitType;      // e.g., BUILDING, ELECTRICAL, PLUMBING, ROOFING, DEMOLITION
    private String status;          // e.g., CLOSED, OPEN, EXPIRED, UNDER_REVIEW, REVOKED
    private LocalDate issuedDate;
    private LocalDate expirationDate;
    private String description;
    private String contractor;
    private Double estimatedCost;
}
