package com.duedilligenceagent.backend.controller;

import com.duedilligenceagent.backend.dto.UserDashboardResponse;
import com.duedilligenceagent.backend.repositories.UserRepository;
import com.duedilligenceagent.backend.service.UserDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Role-dashboard aggregations (SRS RBAC): every endpoint returns only the
 * calling user's own data, so any authenticated role may call any of
 * them — the dashboards choose which payload to render per role.
 * <ul>
 *   <li>{@code GET /api/dashboard/monitored} — the change-watch list
 *       (buyer dashboard).</li>
 *   <li>{@code GET /api/dashboard/review-queue} — properties whose
 *       legal/permit/zoning position needs review (legal reviewer).</li>
 *   <li>{@code GET /api/dashboard/portfolio-risk} — risk-tier
 *       distribution over the caller's own portfolio (financial
 *       institution).</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class UserDashboardController {

    private final UserDashboardService dashboardService;
    private final UserRepository userRepository;

    @GetMapping("/monitored")
    public ResponseEntity<List<UserDashboardResponse.MonitoredProperty>> monitored(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.monitoredProperties(userIdOf(userDetails)));
    }

    @GetMapping("/review-queue")
    public ResponseEntity<List<UserDashboardResponse.ReviewQueueItem>> reviewQueue(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.reviewQueue(userIdOf(userDetails)));
    }

    @GetMapping("/portfolio-risk")
    public ResponseEntity<UserDashboardResponse.PortfolioRisk> portfolioRisk(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.portfolioRisk(userIdOf(userDetails)));
    }

    /** Resolves the authenticated user's id from the JWT principal. */
    private Long userIdOf(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found: " + userDetails.getUsername()))
                .getUserId();
    }
}
