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
        // Clear old sample records if they exist to refresh with Maharashtra properties
        boolean needsMaharashtrianData = propertyRepository.findAll().stream()
                .noneMatch(p -> "Pune".equalsIgnoreCase(p.getCity()) || "Mumbai".equalsIgnoreCase(p.getCity()));

        if (propertyRepository.count() == 0 || needsMaharashtrianData) {
            log.info("Refreshing database with Maharashtra properties (Pune, Mumbai, Nashik, Nagpur, Sambhajinagar)...");
            propertyRepository.deleteAll();

            Property p1 = new Property();
            p1.setTitle("Kothrud Heritage Bungalow & Garden");
            p1.setAddress("Plot 14, Mayur Colony, Kothrud");
            p1.setCity("Pune");
            p1.setState("MH");
            p1.setZipCode("411038");
            p1.setCountry("India");
            p1.setPrice(new BigDecimal("28500000.00")); // ₹2.85 Cr
            p1.setBedrooms(4);
            p1.setBathrooms(4);
            p1.setSquareFeet(3400.0);
            p1.setPropertyType("Villa");
            p1.setYearBuilt(2022);
            p1.setDescription("Spacious independent bungalow with private garden, solar setup, and clear NA title near Karve Road.");
            p1.setStatus("AVAILABLE");

            Property p2 = new Property();
            p2.setTitle("Bandra West Sea-Facing Luxury Apartment");
            p2.setAddress("Flat 1202, Pali Hill Road, Bandra West");
            p2.setCity("Mumbai");
            p2.setState("MH");
            p2.setZipCode("400050");
            p2.setCountry("India");
            p2.setPrice(new BigDecimal("65000000.00")); // ₹6.50 Cr
            p2.setBedrooms(3);
            p2.setBathrooms(3);
            p2.setSquareFeet(1950.0);
            p2.setPropertyType("Luxury Apartment");
            p2.setYearBuilt(2024);
            p2.setDescription("Ultra-luxury sea-facing flat with high-speed elevators, 2 covered car parks, and BMC occupancy certificate.");
            p2.setStatus("AVAILABLE");

            Property p3 = new Property();
            p3.setTitle("Baner High-Rise Smart Condominium");
            p3.setAddress("Tower B-1504, Pancard Club Road, Baner");
            p3.setCity("Pune");
            p3.setState("MH");
            p3.setZipCode("411045");
            p3.setCountry("India");
            p3.setPrice(new BigDecimal("14500000.00")); // ₹1.45 Cr
            p3.setBedrooms(3);
            p3.setBathrooms(3);
            p3.setSquareFeet(1550.0);
            p3.setPropertyType("Condominium");
            p3.setYearBuilt(2023);
            p3.setDescription("Modern smart home with clubhouse, EV charging stations, and close proximity to Hinjewadi IT Park.");
            p3.setStatus("AVAILABLE");

            Property p4 = new Property();
            p4.setTitle("Gangapur Road Vineyard View Duplex");
            p4.setAddress("Bungalow 7, Serene Meadows, Gangapur Road");
            p4.setCity("Nashik");
            p4.setState("MH");
            p4.setZipCode("422013");
            p4.setCountry("India");
            p4.setPrice(new BigDecimal("9800000.00")); // ₹98 Lakhs
            p4.setBedrooms(3);
            p4.setBathrooms(3);
            p4.setSquareFeet(2200.0);
            p4.setPropertyType("Duplex");
            p4.setYearBuilt(2021);
            p4.setDescription("Scenic duplex home near Godavari river belt with tranquil green surroundings and NMC sanctions.");
            p4.setStatus("AVAILABLE");

            Property p5 = new Property();
            p5.setTitle("Civil Lines Premium Green Residence");
            p5.setAddress("Flat 5A, Palm Grove, Civil Lines");
            p5.setCity("Nagpur");
            p5.setState("MH");
            p5.setZipCode("440001");
            p5.setCountry("India");
            p5.setPrice(new BigDecimal("12000000.00")); // ₹1.20 Cr
            p5.setBedrooms(3);
            p5.setBathrooms(2);
            p5.setSquareFeet(1800.0);
            p5.setPropertyType("Apartment");
            p5.setYearBuilt(2020);
            p5.setDescription("Centrally located residence in green zone near High Court and Vidhan Bhavan with RERA clearance.");
            p5.setStatus("PENDING");

            Property p6 = new Property();
            p6.setTitle("CIDCO Commercial Tech & Office Park");
            p6.setAddress("Sector N-1, Town Centre, Jalna Road, CIDCO");
            p6.setCity("Chhatrapati Sambhajinagar");
            p6.setState("MH");
            p6.setZipCode("431003");
            p6.setCountry("India");
            p6.setPrice(new BigDecimal("45000000.00")); // ₹4.50 Cr
            p6.setBedrooms(0);
            p6.setBathrooms(6);
            p6.setSquareFeet(9200.0);
            p6.setPropertyType("Commercial");
            p6.setYearBuilt(2019);
            p6.setDescription("Multi-tenant commercial building with MIDC clearances and high footfall frontage on main highway.");
            p6.setStatus("AVAILABLE");

            propertyRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6));
            log.info("Successfully seeded 6 Maharashtra properties into database (Pune, Mumbai, Nashik, Nagpur, Sambhajinagar).");
        }
    }
}
