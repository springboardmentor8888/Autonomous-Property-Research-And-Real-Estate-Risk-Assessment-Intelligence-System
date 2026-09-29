package com.realestate.duediligence.dto;

import com.realestate.duediligence.entity.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PropertyDetailsResponse {

	private Long id;
	private String address;
	private List<OwnershipRecord> ownershipHistory;
	private List<TaxHistory> taxHistory;
	private ZoningInfo zoning;
	private FloodZoneInfo floodZone;
	private List<PermitRecord> permits;
	private EnvironmentalRecord environmental;
	private UtilityInfo utility;
}