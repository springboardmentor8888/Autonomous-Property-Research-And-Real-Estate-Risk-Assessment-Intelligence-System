package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Represents one comparable property listing near the property being researched
 * — used for price comparison and market trend context.
 */
@Data
@AllArgsConstructor
public class ComparablePropertyResponse {

	private String address;
	private double price;
	private double distanceKm;
}