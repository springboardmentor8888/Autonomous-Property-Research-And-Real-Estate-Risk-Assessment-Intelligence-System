package com.realestate.duediligence.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePropertyRequest {

	@NotBlank(message = "Address is required")
	@Size(min = 8, max = 255, message = "Address must be 8 to 255 characters")
	private String address;

	// Optional: defaults to RESIDENTIAL in PropertyService when blank.
	private String propertyType;
}