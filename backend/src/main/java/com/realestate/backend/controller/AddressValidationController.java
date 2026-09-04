package com.realestate.backend.controller;

import com.realestate.backend.dto.AddressValidationRequestDTO;
import com.realestate.backend.dto.AddressValidationResponseDTO;
import com.realestate.backend.dto.ApiResponse;
import com.realestate.backend.service.AddressValidationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/address")
@CrossOrigin(origins = "*")
public class AddressValidationController {

    private final AddressValidationService addressValidationService;

    @Autowired
    public AddressValidationController(AddressValidationService addressValidationService) {
        this.addressValidationService = addressValidationService;
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<AddressValidationResponseDTO>> validateAddress(
            @Valid @RequestBody AddressValidationRequestDTO request) {
        AddressValidationResponseDTO result = addressValidationService.validateAddress(request);
        return ResponseEntity.ok(ApiResponse.success("Address validation completed", result));
    }
}
