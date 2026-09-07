package com.realestate.backend.service;

import com.realestate.backend.entity.Ownership;

import java.util.List;

public interface OwnershipService {

Ownership createOwnership(Ownership ownership);

Ownership getOwnershipById(Long id);

List<Ownership> getAllOwnerships();

Ownership updateOwnership(Long id, Ownership ownership);

void deleteOwnership(Long id);

List<Ownership> getOwnershipsByPropertyId(Long propertyId);

}