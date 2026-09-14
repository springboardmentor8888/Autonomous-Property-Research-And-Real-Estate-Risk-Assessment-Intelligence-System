package com.realestate.backend.controller;

import com.realestate.backend.entity.Tax;
import com.realestate.backend.service.TaxService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/taxes")
public class TaxController {

private final TaxService taxService;

public TaxController(TaxService taxService) {
    this.taxService = taxService;
}

@PostMapping("/property/{propertyId}")
public ResponseEntity<Tax> createTax(
        @PathVariable Long propertyId,
        @RequestBody Tax tax) {

    Tax createdTax = taxService.createTax(propertyId, tax);

    return ResponseEntity.ok(createdTax);
}

@GetMapping
public ResponseEntity<List<Tax>> getAllTaxes() {

    return ResponseEntity.ok(taxService.getAllTaxes());
}

@GetMapping("/{id}")
public ResponseEntity<Tax> getTaxById(
        @PathVariable Long id) {

    return ResponseEntity.ok(taxService.getTaxById(id));
}

@GetMapping("/property/{propertyId}")
public ResponseEntity<List<Tax>> getTaxesByPropertyId(
        @PathVariable Long propertyId) {

    return ResponseEntity.ok(
            taxService.getTaxesByPropertyId(propertyId));
}

@PutMapping("/{id}")
public ResponseEntity<Tax> updateTax(
        @PathVariable Long id,
        @RequestBody Tax tax) {

    return ResponseEntity.ok(
            taxService.updateTax(id, tax));
}

@DeleteMapping("/{id}")
public ResponseEntity<String> deleteTax(
        @PathVariable Long id) {

    taxService.deleteTax(id);

    return ResponseEntity.ok("Tax deleted successfully");
}

}