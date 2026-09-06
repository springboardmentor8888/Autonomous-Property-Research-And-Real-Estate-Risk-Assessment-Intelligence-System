package com.realestate.backend.Service;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.Property;
import com.realestate.backend.Exception.PropertyNotFoundException;
import com.realestate.backend.Repository.PropertyRepository;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public Property addProperty(Property property) {
        return propertyRepository.save(property);
    }

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found"));
    }

    public Property updateProperty(Long id, Property property) {

        Property existingProperty = getPropertyById(id);

        existingProperty.setAddress(property.getAddress());
        existingProperty.setPropertyType(property.getPropertyType());
        existingProperty.setPrice(property.getPrice());
        existingProperty.setArea(property.getArea());
        existingProperty.setBedrooms(property.getBedrooms());
        existingProperty.setBathrooms(property.getBathrooms());
        existingProperty.setStatus(property.getStatus());
        existingProperty.setDescription(property.getDescription());

        return propertyRepository.save(existingProperty);
    }

    public void deleteProperty(Long id) {
    	 Property property = getPropertyById(id);
        propertyRepository.deleteById(id);
    }
    public List<Property> searchByPropertyType(String propertyType) {
        return propertyRepository.findByPropertyType(propertyType);
    }
    public List<Property> searchByAddress(String address) {
        return propertyRepository.findByAddressContainingIgnoreCase(address);
    }
    public List<Property> searchByPriceRange(Double minPrice, Double maxPrice) {
        return propertyRepository.findByPriceBetween(minPrice, maxPrice);
    }
    public List<Property> filterProperties(
            String type,
            String address,
            Double minPrice,
            Double maxPrice,
            Integer minBedrooms) {

    	Specification<Property> specification =
    	        (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

        if (type != null && !type.isBlank()) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("propertyType"),
                                    type
                            )
            );
        }

        if (address != null && !address.isBlank()) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.like(
                                    criteriaBuilder.lower(root.get("address")),
                                    "%" + address.toLowerCase() + "%"
                            )
            );
        }

        if (minPrice != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.greaterThanOrEqualTo(
                                    root.get("price"),
                                    minPrice
                            )
            );
        }

        if (maxPrice != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.lessThanOrEqualTo(
                                    root.get("price"),
                                    maxPrice
                            )
            );
        }

        if (minBedrooms != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.greaterThanOrEqualTo(
                                    root.get("bedrooms"),
                                    minBedrooms
                            )
            );
        }

        return propertyRepository.findAll(specification);
    }
}