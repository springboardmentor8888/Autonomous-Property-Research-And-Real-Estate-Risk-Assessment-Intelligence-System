package com.realestate.backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Service.AddressValidationService;
import com.realestate.backend.dto.AddressValidationResponse;

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
@RequestMapping("/api/properties")
public class AddressValidationController {

    private final AddressValidationService addressValidationService;

    public AddressValidationController(
            AddressValidationService addressValidationService) {
        this.addressValidationService = addressValidationService;
    }

    @GetMapping("/{propertyId}/validate-address")
    public ResponseEntity<AddressValidationResponse> validateAddress(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                addressValidationService.validateAddress(propertyId));
    }
}