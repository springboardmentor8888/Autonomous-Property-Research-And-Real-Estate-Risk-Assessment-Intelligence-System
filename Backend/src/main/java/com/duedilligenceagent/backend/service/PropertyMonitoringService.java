package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.dto.MonitoringStatusResponse;
import com.duedilligenceagent.backend.entities.PropertyMonitoring;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.PropertyMonitoringRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Per-user property monitoring ("watch this property"): the user opts in to
 * tracking of record changes (ownership, tax, permits, listings, ...) for a
 * searched property. The scheduler that performs the periodic checks reads
 * the same {@link PropertyMonitoring} rows.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyMonitoringService {

    /** How often monitored properties are re-checked, in hours. */
    private static final int CHECK_INTERVAL_HOURS = 24;

    private final PropertyMonitoringRepository monitoringRepository;
    private final PropertyRepository propertyRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public MonitoringStatusResponse getStatus(Long userId, Long propertyId) {
        requireProperty(propertyId);
        return toResponse(userId, propertyId,
                monitoringRepository.findByUserIdAndPropertyId(userId, propertyId));
    }

    /** Enables monitoring for (user, property); re-enables if previously disabled. */
    @Transactional
    public MonitoringStatusResponse enable(Long userId, Long propertyId) {
        requireProperty(propertyId);
        PropertyMonitoring monitoring = monitoringRepository
                .findByUserIdAndPropertyId(userId, propertyId)
                .orElseGet(() -> PropertyMonitoring.builder()
                        .userId(userId)
                        .propertyId(propertyId)
                        .build());
        boolean reEnabled = monitoring.getMonitoringId() != null;
        monitoring.setEnabled(true);
        if (monitoring.getNextCheckAt() == null) {
            monitoring.setNextCheckAt(LocalDateTime.now().plusHours(CHECK_INTERVAL_HOURS));
        }
        PropertyMonitoring saved = monitoringRepository.save(monitoring);

        // SRS 1.11: notify the user that monitoring is active (in-app + email).
        try {
            String propertyAddress = propertyRepository.findById(propertyId)
                    .map(p -> p.getAddress()).orElse("property #" + propertyId);
            notificationService.notify(userId, NotificationService.TYPE_MONITORING_UPDATE,
                    (reEnabled ? "Record-change monitoring was re-enabled for " : "Record-change monitoring is now active for ")
                            + propertyAddress + ". You will be notified when its records change.",
                    propertyId, null);
        } catch (Exception ex) {
            log.warn("Monitoring notification failed for property id={}: {}", propertyId, ex.getMessage());
        }

        return toResponse(userId, propertyId, Optional.of(saved));
    }

    @Transactional
    public MonitoringStatusResponse disable(Long userId, Long propertyId) {
        requireProperty(propertyId);
        PropertyMonitoring monitoring = monitoringRepository
                .findByUserIdAndPropertyId(userId, propertyId)
                .orElse(null);
        if (monitoring != null) {
            monitoring.setEnabled(false);
            monitoring.setNextCheckAt(null);
            monitoringRepository.save(monitoring);
            return toResponse(userId, propertyId, Optional.of(monitoring));
        }
        return toResponse(userId, propertyId, Optional.empty());
    }

    private void requireProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with id: " + propertyId);
        }
    }

    private MonitoringStatusResponse toResponse(Long userId, Long propertyId,
                                                 Optional<PropertyMonitoring> monitoring) {
        return MonitoringStatusResponse.builder()
                .propertyId(propertyId)
                .userId(userId)
                .enabled(monitoring.map(PropertyMonitoring::getEnabled).orElse(false))
                .lastCheckedAt(monitoring.map(PropertyMonitoring::getLastCheckedAt).orElse(null))
                .nextCheckAt(monitoring.map(PropertyMonitoring::getNextCheckAt).orElse(null))
                .monitoredSince(monitoring.map(PropertyMonitoring::getCreatedAt).orElse(null))
                .build();
    }
}
