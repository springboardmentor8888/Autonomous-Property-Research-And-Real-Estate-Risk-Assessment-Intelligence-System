package com.realestate.backend.service;

import com.realestate.backend.dto.AddressValidationRequestDTO;
import com.realestate.backend.dto.AddressValidationResponseDTO;

public interface AddressValidationService {

    AddressValidationResponseDTO validateAddress(AddressValidationRequestDTO request);
}
