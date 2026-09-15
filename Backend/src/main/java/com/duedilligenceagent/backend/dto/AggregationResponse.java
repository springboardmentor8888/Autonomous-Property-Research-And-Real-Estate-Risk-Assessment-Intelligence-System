package com.duedilligenceagent.backend.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregationResponse {
    private Long aggregationRunId;
    private Long propertyId;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<ProviderObservationResponse> observations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProviderObservationResponse {
        private String provider;
        private String operation;
        private String status;
        private Integer httpStatus;
        private String externalRecordId;
        private String errorMessage;
        private LocalDateTime retrievedAt;
    }
}
