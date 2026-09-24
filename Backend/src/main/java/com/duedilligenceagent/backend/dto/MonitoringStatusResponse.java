package com.duedilligenceagent.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Monitoring state of one property for the current user, returned by the
 * {@code /api/properties/{id}/monitoring} endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitoringStatusResponse {

    private Long propertyId;
    private Long userId;

    /** True when the user monitors this property for record changes. */
    private boolean enabled;

    private LocalDateTime lastCheckedAt;

    /** When the next scheduled record check is due (null when disabled). */
    private LocalDateTime nextCheckAt;

    private LocalDateTime monitoredSince;
}
