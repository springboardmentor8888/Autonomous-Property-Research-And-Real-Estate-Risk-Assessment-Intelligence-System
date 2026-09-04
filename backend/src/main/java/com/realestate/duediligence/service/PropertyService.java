package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.repository.PropertyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service class responsible for handling business logic
 * related to Property operations.
 *
 * @Service tells Spring that this class is a service component
 * and should be managed by the Spring container.
 */
@Service
public class PropertyService {

    /*
     * Repository used to communicate with the database
     * for Property-related operations.
     *
     * final means the reference cannot be changed after
     * it is initialized through the constructor.
     */
    private final PropertyRepository propertyRepository;

    /**
     * Constructor injection.
     *
     * Spring automatically provides an instance of
     * PropertyRepository when creating PropertyService.
     *
     * @param propertyRepository repository used for Property database operations
     */
    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    /**
     * Searches for properties based on their address.
     *
     * The actual database operation is performed by
     * PropertyRepository's findByAddressContainingIgnoreCase() method.
     *
     * "Containing" allows partial address searches.
     * "IgnoreCase" makes the search case-insensitive.
     *
     * Example:
     * Searching for "hyd" can return "Hyderabad".
     *
     * @param address address or part of an address to search for
     * @return list of properties matching the given address
     */
    public List<Property> searchByAddress(String address) {
        return propertyRepository.findByAddressContainingIgnoreCase(address);
    }
}


