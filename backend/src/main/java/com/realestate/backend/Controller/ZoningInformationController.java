package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.ZoningInformation;
import com.realestate.backend.Service.ZoningInformationService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.backend.Entity.Property;
import com.realestate.backend.Service.PropertyService;

import jakarta.validation.Valid;
@CrossOrigin(origins="http://localhost:5173")
@RestController
@RequestMapping("/api/zoning-information")
public class ZoningInformationController {

    private final ZoningInformationService zoningInformationService;

    public ZoningInformationController(
            ZoningInformationService zoningInformationService) {
        this.zoningInformationService = zoningInformationService;
    }

    @PostMapping
    public ResponseEntity<ZoningInformation> createZoningInformation(
            @RequestBody ZoningInformation zoningInformation) {

        return ResponseEntity.ok(
                zoningInformationService
                        .createZoningInformation(zoningInformation));
    }

    @GetMapping
    public ResponseEntity<List<ZoningInformation>> getAllZoningInformation() {

        return ResponseEntity.ok(
                zoningInformationService
                        .getAllZoningInformation());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ZoningInformation> getZoningInformationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                zoningInformationService
                        .getZoningInformationById(id));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<ZoningInformation>>
            getZoningInformationByPropertyId(
                    @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                zoningInformationService
                        .getZoningInformationByPropertyId(propertyId));
    }
}