package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Entity.ComparableProperty;
import com.realestate.backend.Service.ComparablePropertyService;

@RestController
@RequestMapping("/api/comparable-properties")
public class ComparablePropertyController {

    private final ComparablePropertyService comparablePropertyService;

    public ComparablePropertyController(
            ComparablePropertyService comparablePropertyService) {

        this.comparablePropertyService = comparablePropertyService;
    }

    @PostMapping
    public ResponseEntity<ComparableProperty> createComparableProperty(
            @RequestBody ComparableProperty comparableProperty) {

        return ResponseEntity.ok(
                comparablePropertyService
                        .createComparableProperty(comparableProperty));
    }

    @GetMapping
    public ResponseEntity<List<ComparableProperty>> getAllComparableProperties() {

        return ResponseEntity.ok(
                comparablePropertyService
                        .getAllComparableProperties());
    }

    @GetMapping("/target/{targetPropertyId}")
    public ResponseEntity<List<ComparableProperty>> getByTargetPropertyId(
            @PathVariable Long targetPropertyId) {

        return ResponseEntity.ok(
                comparablePropertyService
                        .getByTargetPropertyId(targetPropertyId));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ComparableProperty> getComparablePropertyById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                comparablePropertyService
                        .getComparablePropertyById(id));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteComparableProperty(
            @PathVariable Long id) {

        comparablePropertyService.deleteComparableProperty(id);

        return ResponseEntity.ok(
                "Comparable property deleted successfully");
    }
    @GetMapping("/nearby/{targetPropertyId}")
    public ResponseEntity<List<ComparableProperty>> getNearbyListings(
            @PathVariable Long targetPropertyId,
            @RequestParam Double maxDistance) {

        return ResponseEntity.ok(
                comparablePropertyService
                        .getNearbyListings(targetPropertyId, maxDistance));
    }
    @GetMapping("/market-trends/{targetPropertyId}")
    public ResponseEntity<Double> getAverageComparablePrice(
            @PathVariable Long targetPropertyId) {

        return ResponseEntity.ok(
                comparablePropertyService
                        .getAverageComparablePrice(targetPropertyId));
    }
    @GetMapping("/price-difference/{comparableId}")
    public ResponseEntity<Double> getPriceDifference(
            @PathVariable Long comparableId) {

        return ResponseEntity.ok(
                comparablePropertyService
                        .getPriceDifference(comparableId));
    }
}