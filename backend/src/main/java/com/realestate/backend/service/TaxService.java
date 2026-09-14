package com.realestate.backend.service;

import com.realestate.backend.entity.Tax;

import java.util.List;

public interface TaxService {

Tax createTax(Long propertyId, Tax tax);

List<Tax> getAllTaxes();

Tax getTaxById(Long id);

List<Tax> getTaxesByPropertyId(Long propertyId);

Tax updateTax(Long id, Tax tax);

void deleteTax(Long id);

}