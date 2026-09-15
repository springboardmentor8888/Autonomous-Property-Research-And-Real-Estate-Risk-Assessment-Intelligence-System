package com.realestate.duediligence.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressValidationRequest {
    private String address;
}
