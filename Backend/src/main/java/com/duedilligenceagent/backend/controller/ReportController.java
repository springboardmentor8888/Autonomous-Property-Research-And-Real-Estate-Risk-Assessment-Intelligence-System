package com.duedilligenceagent.backend.controller;

import com.duedilligenceagent.backend.dto.ReportResponse;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.repositories.UserRepository;
import com.duedilligenceagent.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Due-diligence report endpoints for the current user.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    /** All reports the current user generated, newest first. */
    @GetMapping("/mine")
    public ResponseEntity<List<ReportResponse>> myReports(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found: " + userDetails.getUsername()));
        return ResponseEntity.ok(reportService.listForUser(user.getUserId()));
    }
}
