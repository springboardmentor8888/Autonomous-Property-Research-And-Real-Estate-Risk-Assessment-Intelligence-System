package com.duedilligenceagent.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * One diligence/aggregation run over a property, as listed by
 * {@code GET /api/properties/{id}/aggregations}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregationRunSummary {

    private Long aggregationRunId;
    private Long propertyId;
    private String requestedAddress;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
