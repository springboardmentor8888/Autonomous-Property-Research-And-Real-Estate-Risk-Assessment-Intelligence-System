package com.duedilligenceagent.backend.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.duedilligenceagent.backend.dto.PropertyResponse;
import com.duedilligenceagent.backend.entities.ActivityLog;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.ActivityLogRepository;
import com.duedilligenceagent.backend.service.search.PropertySearchService;
import com.duedilligenceagent.backend.repositories.PropertyRepository;

/**
 * Plain CRUD reads over persisted {@link Property} rows.
 * Search orchestration lives in {@link PropertySearchService} instead.
 */
@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final ActivityLogRepository activityLogRepository;

    public PropertyService(PropertyRepository propertyRepository,
                           ActivityLogRepository activityLogRepository) {
        this.propertyRepository = propertyRepository;
        this.activityLogRepository = activityLogRepository;
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
                        new ResourceNotFoundException(
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

    /**
     * The user's search history: their {@code PROPERTY_SEARCHED} events joined
     * to properties, newest first. Each property appears once (its most recent
     * search), so dataset matches and deduped external searches — where the
     * property row is shared across users — still show in every searcher's
     * own history.
     */
    public List<PropertyResponse> getSearchHistory(Long userId) {
        List<ActivityLog> events = activityLogRepository
                .findByUserIdAndActionOrderByCreatedAtDesc(
                        userId, PropertySearchService.SEARCH_EVENT_ACTION);

        Map<Long, PropertyResponse> byPropertyId = new LinkedHashMap<>();
        for (ActivityLog event : events) {
            Long propertyId = event.getEntityId();
            if (propertyId == null || byPropertyId.containsKey(propertyId)) {
                continue; // newest event per property wins
            }
            propertyRepository.findById(propertyId)
                    .ifPresent(property -> byPropertyId.put(propertyId, toResponse(property)));
        }
        return List.copyOf(byPropertyId.values());
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
                .searchedAt(property.getCreatedAt())
                .build();
    }
}
