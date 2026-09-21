package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.backend.Entity.DueDiligence;
import com.realestate.backend.Service.DueDiligenceService;
import com.realestate.backend.Service.NotificationService;
import com.realestate.backend.Service.PropertyService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/due-diligence")
public class DueDiligenceController {

    private final DueDiligenceService dueDiligenceService;
    private final NotificationService notificationService;
    private final PropertyService propertyService;

    public DueDiligenceController(
            DueDiligenceService dueDiligenceService,
            NotificationService notificationService,
            PropertyService propertyService) {

        this.dueDiligenceService = dueDiligenceService;
        this.notificationService = notificationService;
        this.propertyService = propertyService;
    }

    @PostMapping
    public ResponseEntity<DueDiligence> createDueDiligence(
            @RequestBody DueDiligence dueDiligence) {

        DueDiligence saved =
                dueDiligenceService.createDueDiligence(dueDiligence);

        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<DueDiligence>> getAllDueDiligence() {

        return ResponseEntity.ok(
                dueDiligenceService.getAllDueDiligence()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<DueDiligence> getDueDiligenceById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                dueDiligenceService.getDueDiligenceById(id)
        );
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<DueDiligence> completeDueDiligence(
            @PathVariable Long id) {

        DueDiligence dueDiligence =
                dueDiligenceService.completeDueDiligence(id);

        Long propertyId = dueDiligence.getProperty().getId();

        String propertyAddress =
                propertyService.getPropertyById(propertyId).getAddress();

        notificationService.createNotification(
                propertyId,
                "anju@example.com",
                "DUE_DILIGENCE_COMPLETED",
                "Due diligence process completed for property: "
                        + propertyAddress);

        return ResponseEntity.ok(dueDiligence);
    }
}