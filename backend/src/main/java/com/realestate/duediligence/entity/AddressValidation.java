package com.realestate.duediligence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "address_validations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "submitted_address", nullable = false)
    private String submittedAddress;

    @Column(name = "validated_address")
    private String validatedAddress;

    @Column(name = "is_valid", nullable = false)
    private Boolean isValid;

    @Column(name = "validation_source")
    private String validationSource;
}
