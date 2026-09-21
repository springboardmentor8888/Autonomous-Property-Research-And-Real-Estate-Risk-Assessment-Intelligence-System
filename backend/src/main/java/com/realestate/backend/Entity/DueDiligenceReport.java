package com.realestate.backend.Entity;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DueDiligenceReport {

    private Long propertyId;

    private String propertyAddress;

    private String executiveSummary;

    private Integer riskScore;

    private String overallRisk;

    private String propertyTimeline;

    private String supportingDocuments;

    private LocalDateTime generatedAt;
}