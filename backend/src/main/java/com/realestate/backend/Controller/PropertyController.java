package com.realestate.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.backend.Entity.Property;
import com.realestate.backend.Service.PropertyService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @PostMapping
    public ResponseEntity<Property> addProperty( @Valid @RequestBody Property property) {
        return ResponseEntity.ok(propertyService.addProperty(property));
    }

    @GetMapping
    public ResponseEntity<List<Property>> getAllProperties() {
        return ResponseEntity.ok(propertyService.getAllProperties());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody Property property) {

        return ResponseEntity.ok(
                propertyService.updateProperty(id, property)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.ok("Property deleted successfully");
    }
    @GetMapping("/search")
    public ResponseEntity<List<Property>> searchByPropertyType(
            @RequestParam String propertyType) {

        return ResponseEntity.ok(
                propertyService.searchByPropertyType(propertyType)
        );
    }
    @GetMapping("/search/address")
    public ResponseEntity<List<Property>> searchByAddress(
            @RequestParam String address) {

        return ResponseEntity.ok(
                propertyService.searchByAddress(address)
        );
    }
    @GetMapping("/search/price")
    public ResponseEntity<List<Property>> searchByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {

        return ResponseEntity.ok(
                propertyService.searchByPriceRange(minPrice, maxPrice)
        );
    }
    @GetMapping("/filter")
    public ResponseEntity<List<Property>> filterProperties(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minBedrooms) {

        return ResponseEntity.ok(
                propertyService.filterProperties(
                        type,
                        address,
                        minPrice,
                        maxPrice,
                        minBedrooms
                )
        );
    }
}