package com.realestate.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.ComparableProperty;
import com.realestate.backend.Exception.ComparablePropertyNotFoundException;
import com.realestate.backend.Repository.ComparablePropertyRepository;
import com.realestate.backend.Repository.PropertyRepository;

@Service
public class ComparablePropertyService {

    private final ComparablePropertyRepository comparablePropertyRepository;
    private final PropertyRepository propertyRepository;

    public ComparablePropertyService(
            ComparablePropertyRepository comparablePropertyRepository,  PropertyRepository propertyRepository) {

        this.comparablePropertyRepository = comparablePropertyRepository;
        this.propertyRepository = propertyRepository;
    }
    public ComparableProperty createComparableProperty(
            ComparableProperty comparableProperty) {

        Long targetPropertyId =
                comparableProperty.getTargetProperty().getId();

        Long comparablePropertyId =
                comparableProperty.getComparableProperty().getId();

        var targetProperty = propertyRepository.findById(targetPropertyId)
                .orElseThrow(() ->
                        new RuntimeException("Target property not found"));

        var comparablePropertyData =
                propertyRepository.findById(comparablePropertyId)
                        .orElseThrow(() ->
                                new RuntimeException("Comparable property not found"));

        double priceDifference =
                targetProperty.getPrice()
                - comparablePropertyData.getPrice();

        double pricePerSqft =
                comparablePropertyData.getPrice()
                / comparablePropertyData.getArea();

        comparableProperty.setPriceDifference(priceDifference);
        comparableProperty.setPricePerSqft(pricePerSqft);

        return comparablePropertyRepository.save(comparableProperty);
    }
    public List<ComparableProperty> getAllComparableProperties() {

        return comparablePropertyRepository.findAll();
    }
    public List<ComparableProperty> getByTargetPropertyId(Long targetPropertyId) {

        return comparablePropertyRepository
                .findByTargetPropertyId(targetPropertyId);
    }
    public ComparableProperty getComparablePropertyById(Long id) {

        return comparablePropertyRepository.findById(id)
                .orElseThrow(() ->
                        new ComparablePropertyNotFoundException("Comparable property not found"));
    }
    public void deleteComparableProperty(Long id) {

        if (!comparablePropertyRepository.existsById(id)) {
            throw new ComparablePropertyNotFoundException(
                    "Comparable property not found with id: " + id);
        }

        comparablePropertyRepository.deleteById(id);
    }
    public List<ComparableProperty> getNearbyListings(
            Long targetPropertyId,
            Double maxDistance) {

        List<ComparableProperty> comparables =
                comparablePropertyRepository
                        .findByTargetPropertyId(targetPropertyId);

        return comparables.stream()
                .filter(comparable ->
                        comparable.getDistance() != null
                        && comparable.getDistance() <= maxDistance)
                .toList();
    }
    public Double getAverageComparablePrice(Long targetPropertyId) {

        List<ComparableProperty> comparables =
                comparablePropertyRepository
                        .findByTargetPropertyId(targetPropertyId);

        if (comparables.isEmpty()) {
            return 0.0;
        }

        return comparables.stream()
                .map(comparable ->
                        comparable.getComparableProperty().getPrice())
                .filter(price -> price != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }
    public Double getPriceDifference(Long comparableId) {

        ComparableProperty comparableProperty =
                comparablePropertyRepository.findById(comparableId)
                        .orElseThrow(() ->
                                new ComparablePropertyNotFoundException(
                                        "Comparable property not found with id: " + comparableId));

        return comparableProperty.getPriceDifference();
    }
}