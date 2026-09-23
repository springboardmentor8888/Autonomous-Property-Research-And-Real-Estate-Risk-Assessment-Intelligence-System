package com.duedilligenceagent.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.duedilligenceagent.backend.dto.PropertyResponse;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.repositories.PropertyRepository;

/**
 * Plain CRUD reads over persisted {@link Property} rows.
 * Search orchestration lives in {@link PropertySearchService} instead.
 */
@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    // @Cacheable intentionally omitted: Redis is not configured for local dev,
    // and the previous RedisCacheManager bean caused ClassCastExceptions when
    // Spring DevTools restarted the JVM with a fresh classloader. Re-add
    // @Cacheable once a real Redis instance is wired up.
    public List<PropertyResponse> getAllProperties() {
        return propertyRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Property not found with id: " + id
                        ));

        return toResponse(property);
    }

    public List<PropertyResponse> searchByCity(String city) {
        return propertyRepository.findByCityIgnoreCase(city)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PropertyResponse> searchByState(String state) {
        return propertyRepository.findByStateIgnoreCase(state)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PropertyResponse> searchByPropertyType(String propertyType) {
        return propertyRepository.findByPropertyTypeIgnoreCase(propertyType)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private PropertyResponse toResponse(Property property) {
        return PropertyResponse.builder()
                .propertyId(property.getPropertyId())
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .postalCode(property.getPostalCode())
                .latitude(property.getLatitude())
                .longitude(property.getLongitude())
                .propertyType(property.getPropertyType())
                .locality(property.getLocality())
                .googlePlaceId(property.getGooglePlaceId())
                .validationGranularity(property.getValidationGranularity())
                .geocodeGranularity(property.getGeocodeGranularity())
                .addressComplete(property.getAddressComplete())
                .hasUnconfirmedComponents(property.getHasUnconfirmedComponents())
                .possibleNextAction(property.getPossibleNextAction())
                .placeTypes(PropertyResponse.splitCsv(property.getPlaceTypes()))
                .plusCode(property.getPlusCode())
                .externalListingId(property.getExternalListingId())
                .title(property.getTitle())
                .propertySubtype(property.getPropertySubtype())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .balconies(property.getBalconies())
                .carpetAreaSqft(property.getCarpetAreaSqft())
                .superAreaSqft(property.getSuperAreaSqft())
                .areaText(property.getAreaText())
                .sqm(property.getSqm())
                .price(property.getPrice())
                .pricePerSqft(property.getPricePerSqft())
                .deposit(property.getDeposit())
                .brokerage(property.getBrokerage())
                .originalPrice(property.getOriginalPrice())
                .originalCurrency(property.getOriginalCurrency())
                .furnishing(property.getFurnishing())
                .facing(property.getFacing())
                .floor(property.getFloor())
                .totalFloors(property.getTotalFloors())
                .age(property.getAge())
                .availability(property.getAvailability())
                .transaction(property.getTransaction())
                .source(property.getSource())
                .reraId(property.getReraId())
                .listedBy(property.getListedBy())
                .dealer(property.getDealer())
                .gatedCommunity(property.getGatedCommunity())
                .verified(property.getVerified())
                .amenities(PropertyResponse.splitCsv(property.getAmenities()))
                .images(PropertyResponse.splitCsv(property.getImages()))
                .description(property.getDescription())
                .listingUrl(property.getListingUrl())
                .postingDate(property.getPostingDate())
                .updateDate(property.getUpdateDate())
                .expiryDate(property.getExpiryDate())
                .mapAccuracy(property.getMapAccuracy())
                .build();
    }
}
