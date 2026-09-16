package com.realestate.duediligence.dto;

import lombok.Data;

/**
 * Data Transfer Object (DTO) used to receive an address
 * from the client when requesting address validation.
 *
 * DTOs are used to transfer data between the client and
 * the application without directly exposing entity classes.
 *
 * Example JSON request:
 *
 * {
 *     "address": "Kukatpally, Hyderabad, Telangana"
 * }
 */
@Data
public class AddressValidationRequest {

    /*
     * Stores the address received from the client.
     *
     * Lombok's @Data automatically generates:
     * - Getter: getAddress()
     * - Setter: setAddress()
     * - toString()
     * - equals()
     * - hashCode()
     *
     * This allows the controller to use:
     *
     * request.getAddress()
     */
    private String address;
}