package com.realestate.backend.service;

import com.realestate.backend.entity.Permit;

import java.util.List;

public interface PermitService {

    Permit createPermit(Long propertyId, Permit permit);

    List<Permit> getAllPermits();

    Permit getPermitById(Long id);

    List<Permit> getPermitsByPropertyId(Long propertyId);

    Permit updatePermit(Long id, Permit permit);

    void deletePermit(Long id);
}