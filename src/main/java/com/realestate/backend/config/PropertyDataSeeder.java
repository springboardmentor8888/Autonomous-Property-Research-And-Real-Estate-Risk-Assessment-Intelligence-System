package com.realestate.backend.config;

import com.realestate.backend.entity.Property;
import com.realestate.backend.repository.PropertyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class PropertyDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PropertyDataSeeder.class);
    private final PropertyRepository propertyRepository;

    public PropertyDataSeeder(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @Override
    public void run(String... args) {
        if (propertyRepository.count() == 0) {
            log.info("Seeding initial properties into database...");

            Property p1 = new Property();
            p1.setTitle("Modern Coastal Villa");
            p1.setAddress("742 Evergreen Terrace");
            p1.setCity("Miami");
            p1.setState("FL");
            p1.setZipCode("33139");
            p1.setCountry("USA");
            p1.setPrice(new BigDecimal("1250000.00"));
            p1.setBedrooms(4);
            p1.setBathrooms(3);
            p1.setSquareFeet(3200.0);
            p1.setPropertyType("Single Family");
            p1.setYearBuilt(2021);
            p1.setDescription("Luxury waterfront villa with smart home automation and pool.");
            p1.setStatus("AVAILABLE");

            Property p2 = new Property();
            p2.setTitle("Downtown Luxury Penthouse");
            p2.setAddress("1200 Brickell Bay Dr, Apt 42B");
            p2.setCity("Miami");
            p2.setState("FL");
            p2.setZipCode("33131");
            p2.setCountry("USA");
            p2.setPrice(new BigDecimal("890000.00"));
            p2.setBedrooms(2);
            p2.setBathrooms(2);
            p2.setSquareFeet(1650.0);
            p2.setPropertyType("Condo");
            p2.setYearBuilt(2023);
            p2.setDescription("High-rise penthouse overlooking Biscayne Bay with concierge service.");
            p2.setStatus("AVAILABLE");

            Property p3 = new Property();
            p3.setTitle("Historic Brownstone Residence");
            p3.setAddress("456 Pine Lane");
            p3.setCity("Orlando");
            p3.setState("FL");
            p3.setZipCode("32801");
            p3.setCountry("USA");
            p3.setPrice(new BigDecimal("575000.00"));
            p3.setBedrooms(3);
            p3.setBathrooms(2);
            p3.setSquareFeet(2100.0);
            p3.setPropertyType("Townhouse");
            p3.setYearBuilt(2018);
            p3.setDescription("Renovated brick townhouse near city center and parks.");
            p3.setStatus("PENDING");

            Property p4 = new Property();
            p4.setTitle("Suburban Craftsman Estate");
            p4.setAddress("88 Ocean Drive");
            p4.setCity("Tampa");
            p4.setState("FL");
            p4.setZipCode("33602");
            p4.setCountry("USA");
            p4.setPrice(new BigDecimal("420000.00"));
            p4.setBedrooms(3);
            p4.setBathrooms(2);
            p4.setSquareFeet(1850.0);
            p4.setPropertyType("Single Family");
            p4.setYearBuilt(2019);
            p4.setDescription("Spacious single-story home with large backyard and upgraded kitchen.");
            p4.setStatus("AVAILABLE");

            Property p5 = new Property();
            p5.setTitle("Metro Commercial Office Plaza");
            p5.setAddress("500 West Grand Avenue");
            p5.setCity("Jacksonville");
            p5.setState("FL");
            p5.setZipCode("32202");
            p5.setCountry("USA");
            p5.setPrice(new BigDecimal("2100000.00"));
            p5.setBedrooms(0);
            p5.setBathrooms(4);
            p5.setSquareFeet(8500.0);
            p5.setPropertyType("Commercial");
            p5.setYearBuilt(2015);
            p5.setDescription("Prime commercial parcel zoned for multi-tenant retail and corporate offices.");
            p5.setStatus("AVAILABLE");

            propertyRepository.saveAll(List.of(p1, p2, p3, p4, p5));
            log.info("Successfully seeded 5 properties into database.");
        }
    }
}
