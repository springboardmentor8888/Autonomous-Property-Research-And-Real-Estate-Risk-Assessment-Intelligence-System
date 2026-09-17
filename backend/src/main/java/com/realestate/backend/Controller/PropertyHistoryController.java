package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.PropertyHistory;
import com.realestate.backend.Service.PropertyHistoryService;

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
@RequestMapping("/api/property-history")
public class PropertyHistoryController {

    private final PropertyHistoryService propertyHistoryService;

    public PropertyHistoryController(PropertyHistoryService propertyHistoryService) {
        this.propertyHistoryService = propertyHistoryService;
    }

    @PostMapping
    public ResponseEntity<PropertyHistory> createHistory(
            @RequestBody PropertyHistory history) {

        return ResponseEntity.ok(
                propertyHistoryService.createHistory(history));
    }

    @GetMapping
    public ResponseEntity<List<PropertyHistory>> getAllHistory() {

        return ResponseEntity.ok(
                propertyHistoryService.getAllHistory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyHistory> getHistoryById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                propertyHistoryService.getHistoryById(id));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<PropertyHistory>> getHistoryByPropertyId(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                propertyHistoryService.getHistoryByPropertyId(propertyId));
    }
}