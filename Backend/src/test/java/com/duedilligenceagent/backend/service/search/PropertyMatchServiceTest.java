package com.duedilligenceagent.backend.service.search;

import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Verifies the due-diligence dataset matching: city is required, the
 * project name must be identified in the address line, and non-matching
 * input falls through to the external pipeline.
 */
@ExtendWith(MockitoExtension.class)
class PropertyMatchServiceTest {

    @Mock
    private PropertyRepository propertyRepository;

    @InjectMocks
    private PropertyMatchService matchService;

    private static Property seed(long id, String address, String city, String pincode) {
        return Property.builder()
                .propertyId(id)
                .address(address)
                .city(city)
                .state("State")
                .postalCode(pincode)
                .build();
    }

    private static final List<Property> SEEDS = List.of(
            seed(1001, "Casagrand Pallagio, Thoraipakkam, Rajiv Gandhi Salai, Chennai, Tamil Nadu 600097",
                    "Chennai", "600097"),
            seed(1004, "Casagrand Bloom, Thirumudivakkam, Chennai, Tamil Nadu 600044",
                    "Chennai", "600044"),
            seed(1011, "SOBHA OneWorld, Greater Whitefield, Bengaluru, Karnataka 560049",
                    "Bengaluru", "560049"),
            seed(1026, "Lodha Belmondo, Pune, Maharashtra", "Pune", "412115")
    );

    private Optional<Property> match(String address, String city) {
        return matchService.findMatch(PropertyDetailsRequest.builder()
                .address(address).city(city).state("State").build());
    }

    @Test
    void matchesFullProjectNameWithCity() {
        when(propertyRepository.findPropertiesWithDiligenceRecords()).thenReturn(SEEDS);
        assertThat(match("Casagrand Pallagio", "Chennai"))
                .map(Property::getPropertyId).contains(1001L);
    }

    @Test
    void matchesPartialProjectName() {
        when(propertyRepository.findPropertiesWithDiligenceRecords()).thenReturn(SEEDS);
        assertThat(match("Pallagio", "Chennai"))
                .map(Property::getPropertyId).contains(1001L);
    }

    @Test
    void matchesNameInsideLongerAddressLine() {
        when(propertyRepository.findPropertiesWithDiligenceRecords()).thenReturn(SEEDS);
        assertThat(match("Casagrand Pallagio, Thoraipakkam, OMR", "Chennai"))
                .map(Property::getPropertyId).contains(1001L);
    }

    @Test
    void matchesMultiWordProjectName() {
        when(propertyRepository.findPropertiesWithDiligenceRecords()).thenReturn(SEEDS);
        assertThat(match("SOBHA OneWorld, Whitefield", "Bengaluru"))
                .map(Property::getPropertyId).contains(1011L);
    }

    @Test
    void cityMismatchNeverMatches() {
        when(propertyRepository.findPropertiesWithDiligenceRecords()).thenReturn(SEEDS);
        assertThat(match("Casagrand Pallagio", "Mumbai")).isEmpty();
    }

    @Test
    void unknownPropertyFallsThrough() {
        when(propertyRepository.findPropertiesWithDiligenceRecords()).thenReturn(SEEDS);
        assertThat(match("Gateway of India", "Mumbai")).isEmpty();
        assertThat(match("Bandra Kurla Complex", "Mumbai")).isEmpty();
    }

    @Test
    void localityAloneDoesNotMatch() {
        when(propertyRepository.findPropertiesWithDiligenceRecords()).thenReturn(SEEDS);
        // "Thoraipakkam" is a locality of 1001 but not its project name.
        assertThat(match("Thoraipakkam", "Chennai")).isEmpty();
    }

    @Test
    void blankAddressNeverMatches() {
        assertThat(matchService.findMatch(PropertyDetailsRequest.builder()
                .address("").city("Chennai").state("State").build())).isEmpty();
    }

    @Test
    void emptyDatasetFallsThrough() {
        when(propertyRepository.findPropertiesWithDiligenceRecords()).thenReturn(List.of());
        assertThat(match("Casagrand Pallagio", "Chennai")).isEmpty();
    }
}
