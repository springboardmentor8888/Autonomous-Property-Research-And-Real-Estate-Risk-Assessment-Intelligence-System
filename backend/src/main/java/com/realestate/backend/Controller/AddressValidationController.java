package com.realestate.backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.backend.Service.AddressValidationService;
import com.realestate.backend.dto.AddressValidationResponse;

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