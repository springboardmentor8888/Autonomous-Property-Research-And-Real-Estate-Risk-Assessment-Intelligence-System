package com.duedilligenceagent.backend.controller;

import com.duedilligenceagent.backend.service.DueDiligenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DueDiligenceController {

    private final DueDiligenceService dueDiligenceService;

    @PostMapping("/properties/{propertyId}/risk-assessment")
    public ResponseEntity<Map<String, Object>> assessRisk(@PathVariable Long propertyId) {
        return ResponseEntity.ok(dueDiligenceService.assessRisk(propertyId));
    }

    @GetMapping("/properties/{propertyId}/risk-assessment")
    public ResponseEntity<Map<String, Object>> getRisk(@PathVariable Long propertyId) {
        return ResponseEntity.ok(dueDiligenceService.getRisk(propertyId));
    }

    @GetMapping("/properties/{propertyId}/comparables")
    public ResponseEntity<Map<String, Object>> comparables(@PathVariable Long propertyId) {
        return ResponseEntity.ok(dueDiligenceService.compareProperties(propertyId));
    }

    @GetMapping("/properties/{propertyId}/valuation")
    public ResponseEntity<Map<String, Object>> valuation(@PathVariable Long propertyId) {
        return ResponseEntity.ok(dueDiligenceService.valuation(propertyId));
    }

    @PostMapping("/properties/{propertyId}/reports")
    public ResponseEntity<Map<String, Object>> generateReport(@PathVariable Long propertyId,
                                                                Authentication authentication) {
        return ResponseEntity.ok(dueDiligenceService.generateReport(propertyId, authentication));
    }

    @GetMapping("/reports/{reportId}")
    public ResponseEntity<Map<String, Object>> report(@PathVariable Long reportId) {
        return ResponseEntity.ok(dueDiligenceService.getReport(reportId));
    }

    @GetMapping("/reports/{reportId}/export")
    public ResponseEntity<ByteArrayResource> export(@PathVariable Long reportId,
                                                     @RequestParam(defaultValue = "pdf") String format) {
        boolean excel = "xlsx".equalsIgnoreCase(format) || "excel".equalsIgnoreCase(format);
        byte[] bytes = dueDiligenceService.export(reportId, format);
        String extension = excel ? "xlsx" : "pdf";
        String contentType = excel ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDisposition(ContentDisposition.attachment().filename("due-diligence-report-" + reportId + "." + extension).build());
        headers.setContentLength(bytes.length);
        return ResponseEntity.ok().headers(headers).body(new ByteArrayResource(bytes));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Map<String, Object>>> notifications(Authentication authentication) {
        return ResponseEntity.ok(dueDiligenceService.notifications(authentication));
    }
}
