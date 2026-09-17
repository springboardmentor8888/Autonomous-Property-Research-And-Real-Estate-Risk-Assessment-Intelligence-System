package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.UtilityInformation;
import com.realestate.backend.Service.UtilityInformationService;

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
@RequestMapping("/api/utility-information")
public class UtilityInformationController {

    private final UtilityInformationService utilityInformationService;

    public UtilityInformationController(
            UtilityInformationService utilityInformationService) {
        this.utilityInformationService = utilityInformationService;
    }

    @PostMapping
    public ResponseEntity<UtilityInformation> createUtilityInformation(
            @RequestBody UtilityInformation utilityInformation) {

        return ResponseEntity.ok(
                utilityInformationService
                        .createUtilityInformation(utilityInformation));
    }

    @GetMapping
    public ResponseEntity<List<UtilityInformation>>
            getAllUtilityInformation() {

        return ResponseEntity.ok(
                utilityInformationService
                        .getAllUtilityInformation());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UtilityInformation>
            getUtilityInformationById(
                    @PathVariable Long id) {

        return ResponseEntity.ok(
                utilityInformationService
                        .getUtilityInformationById(id));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<UtilityInformation>>
            getUtilityInformationByPropertyId(
                    @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                utilityInformationService
                        .getUtilityInformationByPropertyId(propertyId));
    }
}