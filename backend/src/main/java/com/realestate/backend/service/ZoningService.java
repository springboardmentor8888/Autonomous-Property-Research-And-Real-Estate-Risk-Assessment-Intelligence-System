package com.realestate.backend.service;

import com.realestate.backend.entity.Zoning;

import java.util.List;

public interface ZoningService {

Zoning createZoning(Long propertyId, Zoning zoning);

List<Zoning> getAllZonings();

Zoning getZoningById(Long id);

List<Zoning> getZoningsByPropertyId(Long propertyId);

Zoning updateZoning(Long id, Zoning zoning);

void deleteZoning(Long id);

}