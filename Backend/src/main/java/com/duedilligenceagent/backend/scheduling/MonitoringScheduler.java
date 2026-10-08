package com.duedilligenceagent.backend.scheduling;

import com.duedilligenceagent.backend.entities.BuildingPermitDetails;
import com.duedilligenceagent.backend.entities.EnvironmentalDetails;
import com.duedilligenceagent.backend.entities.FloodZoneDetails;
import com.duedilligenceagent.backend.entities.OwnershipDetails;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.entities.PropertyMonitoring;
import com.duedilligenceagent.backend.entities.TaxDetails;
import com.duedilligenceagent.backend.entities.ZoningDetails;
import com.duedilligenceagent.backend.repositories.BuildingPermitDetailsRepository;
import com.duedilligenceagent.backend.repositories.EnvironmentalDetailsRepository;
import com.duedilligenceagent.backend.repositories.FloodZoneDetailsRepository;
import com.duedilligenceagent.backend.repositories.OwnershipDetailsRepository;
import com.duedilligenceagent.backend.repositories.PropertyMonitoringRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.TaxDetailsRepository;
import com.duedilligenceagent.backend.repositories.ZoningDetailsRepository;
import com.duedilligenceagent.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

/**
 * Scheduled Monitoring (intended software, Module 7): periodically checks
 * every due property monitor and <b>informs the user when the property's
 * stored diligence records changed</b> since the previous check.
 * <p>
 * Change detection is snapshot comparison: each check reads the stored
 * records (ownership, tax, permits, zoning, flood, environmental — the
 * same repositories the diligence pipeline reads), fingerprints their
 * values as a SHA-256 digest and compares it with the digest stored on
 * the previous check. The first check only stores the baseline; a
 * mismatch on a later check sends a {@code MONITORING_UPDATE}
 * notification (in-app + email) and stores the new baseline. With the
 * static seed data fingerprints always match, so nothing spams; the
 * change source in this build is a manual record edit (or, in
 * production, a data-refresh pipeline writing new records — the same
 * scheduler detects it unmodified).
 * <p>
 * Runs every 15 minutes but only processes monitors whose
 * {@code next_check_at} is due (24h cadence, matching
 * {@code PropertyMonitoringService.CHECK_INTERVAL_HOURS}).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MonitoringScheduler {

    /** Matches PropertyMonitoringService's 24h check cadence. */
    private static final int CHECK_INTERVAL_HOURS = 24;

    private final PropertyMonitoringRepository monitoringRepository;
    private final PropertyRepository propertyRepository;
    private final OwnershipDetailsRepository ownershipRepository;
    private final TaxDetailsRepository taxRepository;
    private final BuildingPermitDetailsRepository permitRepository;
    private final ZoningDetailsRepository zoningRepository;
    private final FloodZoneDetailsRepository floodRepository;
    private final EnvironmentalDetailsRepository environmentalRepository;
    private final NotificationService notificationService;

    /** Processes every enabled monitor whose next check is due. */
    @Scheduled(fixedDelay = 15 * 60 * 1000)
    @Transactional
    public void checkDueMonitors() {
        List<PropertyMonitoring> due =
                monitoringRepository.findByEnabledTrueAndNextCheckAtLessThanEqual(LocalDateTime.now());
        if (due.isEmpty()) {
            return;
        }
        log.info("Monitoring scheduler: {} due monitor(s)", due.size());
        for (PropertyMonitoring monitoring : due) {
            try {
                checkOne(monitoring);
            } catch (Exception ex) {
                // One failing monitor must never block the rest of the run.
                log.warn("Monitoring check failed for property id={}: {}",
                        monitoring.getPropertyId(), ex.getMessage());
            }
        }
    }

    /**
     * One monitor check: fingerprint the stored records, compare with the
     * previous digest, notify on change, then advance the schedule.
     * Visible for unit testing.
     */
    void checkOne(PropertyMonitoring monitoring) {
        Long propertyId = monitoring.getPropertyId();
        String digest = digestOf(propertyId);
        LocalDateTime now = LocalDateTime.now();

        if (monitoring.getLastDigest() == null) {
            // First check: store the baseline, no alert.
            monitoring.setLastDigest(digest);
            log.info("Monitoring baseline stored for property id={}", propertyId);
        } else if (!monitoring.getLastDigest().equals(digest)) {
            String address = propertyRepository.findById(propertyId)
                    .map(Property::getAddress)
                    .orElse("property #" + propertyId);
            notificationService.notify(monitoring.getUserId(),
                    NotificationService.TYPE_MONITORING_UPDATE,
                    "Diligence records changed for " + address
                            + " — review the updated due-diligence information.",
                    propertyId, null);
            monitoring.setLastDigest(digest);
            log.info("Monitoring change detected for property id={} — user id={} notified",
                    propertyId, monitoring.getUserId());
        }

        monitoring.setLastCheckedAt(now);
        monitoring.setNextCheckAt(now.plusHours(CHECK_INTERVAL_HOURS));
        monitoringRepository.save(monitoring);
    }

    /**
     * Stable SHA-256 fingerprint of the property's stored diligence
     * record values (the user-facing fields the report renders — fetch
     * metadata like retrievedAt/externalRecordId is deliberately
     * excluded so a re-fetch without value changes never alerts).
     */
    String digestOf(Long propertyId) {
        StringBuilder sb = new StringBuilder();

        ownershipRepository.findByPropertyId(propertyId).ifPresent(o -> sb
                .append("ownership{").append(nullSafe(o.getOwnerName()))
                .append(',').append(nullSafe(o.getOwnershipType()))
                .append(',').append(nullSafe(String.valueOf(o.getRecordDate())))
                .append("}\n"));

        for (TaxDetails t : taxRepository.findByPropertyId(propertyId)) {
            sb.append("tax{").append(nullSafe(String.valueOf(t.getTaxPayDate())))
                    .append(',').append(nullSafe(String.valueOf(t.getTaxAmount())))
                    .append(',').append(nullSafe(String.valueOf(t.getTaxDue())))
                    .append(',').append(nullSafe(t.getPaymentStatus()))
                    .append("}\n");
        }

        for (BuildingPermitDetails p : permitRepository.findByPropertyId(propertyId)) {
            sb.append("permit{").append(nullSafe(p.getPermitNumber()))
                    .append(',').append(nullSafe(p.getPermitType()))
                    .append(',').append(nullSafe(p.getPermitStatus()))
                    .append(',').append(nullSafe(String.valueOf(p.getIssueDate())))
                    .append(',').append(nullSafe(String.valueOf(p.getCompletionDate())))
                    .append("}\n");
        }

        for (ZoningDetails z : zoningRepository.findByPropertyId(propertyId)) {
            sb.append("zoning{").append(nullSafe(z.getZoningCode()))
                    .append(',').append(nullSafe(z.getZoningStatus()))
                    .append(',').append(nullSafe(z.getAllowedUse()))
                    .append(',').append(nullSafe(String.valueOf(z.getEffectiveFrom())))
                    .append("}\n");
        }

        for (FloodZoneDetails f : floodRepository.findByPropertyId(propertyId)) {
            sb.append("flood{").append(nullSafe(f.getZone()))
                    .append(',').append(nullSafe(f.getRiskLevel()))
                    .append(',').append(nullSafe(String.valueOf(f.getEffectiveDate())))
                    .append("}\n");
        }

        for (EnvironmentalDetails e : environmentalRepository.findByPropertyId(propertyId)) {
            sb.append("environmental{").append(nullSafe(e.getRecordType()))
                    .append(',').append(nullSafe(e.getStatus()))
                    .append(',').append(nullSafe(e.getRiskLevel()))
                    .append(',').append(nullSafe(e.getDescription()))
                    .append("}\n");
        }

        return sha256(sb.toString());
    }

    private static String sha256(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    digest.digest(content.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            // SHA-256 is part of the JDK — unreachable.
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }

    private static String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
