package com.duedilligenceagent.backend.service.search;

import com.duedilligenceagent.backend.dto.Property.PropertyDetailsRequest;
import com.duedilligenceagent.backend.dto.Property.PropertySearchApiResponse;
import com.duedilligenceagent.backend.entities.Property;
import com.duedilligenceagent.backend.integration.google.GoogleCandidate;
import com.duedilligenceagent.backend.repositories.ComparablePropertyDetailsRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.integration.apify.ApifyClient;
import com.duedilligenceagent.backend.integration.apify.ApifyPropertyMapper;
import com.duedilligenceagent.backend.integration.google.GooglePlacesDetailsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Verifies the external path's dedup: Google place ids are not always
 * stable for landmark-level addresses, so a stored property with the same
 * resolved address+city must be reused (with its place id refreshed)
 * instead of persisting a duplicate row.
 */
@ExtendWith(MockitoExtension.class)
class ExternalPropertySearchServiceTest {

    @Mock private AddressValidationStrategy addressValidationStrategy;
    @Mock private PropertyRepository propertyRepository;
    @Mock private ComparablePropertyDetailsRepository comparableRepository;
    @Mock private GooglePlacesDetailsService placesDetailsService;
    @Mock private ApifyClient apifyClient;
    @Mock private ApifyPropertyMapper apifyPropertyMapper;
    @Mock private ComparableListings comparableListings;

    @InjectMocks private ExternalPropertySearchService service;

    private static PropertyDetailsRequest request(String address, String city) {
        return PropertyDetailsRequest.builder()
                .address(address)
                .city(city)
                .state("Maharashtra")
                .build();
    }

    private static GoogleCandidate candidate(String placeId, String formattedAddress, String city) {
        return GoogleCandidate.builder()
                .placeId(placeId)
                .formattedAddress(formattedAddress)
                .city(city)
                .propertyType("LANDMARK") // already classified — no Places call
                .validationGranularity("PREMISE")
                .addressComplete(true)
                .build();
    }

    @Test
    void reusesStoredPropertyByResolvedAddressWhenPlaceIdChanged() throws Exception {
        // Google returns a NEW place id for the same landmark...
        GoogleCandidate candidate =
                candidate("ChIJNEW_place_id", "Gateway of India, Mumbai, Maharashtra, India", "Mumbai");
        when(addressValidationStrategy.validate(any())).thenReturn(List.of(candidate));
        when(propertyRepository.findByGooglePlaceId("ChIJNEW_place_id")).thenReturn(Optional.empty());

        // ...but the resolved address+city matches the stored row.
        Property stored = Property.builder()
                .propertyId(3L)
                .address("Gateway of India, Mumbai, Maharashtra, India")
                .city("Mumbai")
                .googlePlaceId("ChIJOLD_place_id")
                .externalListingId("listing-1") // already enriched
                .build();
        when(propertyRepository.findFirstByAddressIgnoreCaseAndCityIgnoreCaseOrderByPropertyIdAsc(
                anyString(), anyString())).thenReturn(Optional.of(stored));
        when(propertyRepository.save(any(Property.class))).thenAnswer(inv -> inv.getArgument(0));
        when(comparableListings.forProperty(3L)).thenReturn(List.of());

        SearchOutcome outcome = service.search(
                request("Gateway of India", "Mumbai"), "Gateway of India, Mumbai", 7L);

        assertThat(outcome.property()).isSameAs(stored);
        assertThat(stored.getGooglePlaceId()).isEqualTo("ChIJNEW_place_id"); // refreshed
        assertThat(outcome.response().getData().getResults().get(0).getPropertyId()).isEqualTo(3L);
        // The only save is the place-id refresh of the stored row — no
        // duplicate property is persisted and Apify is not re-fetched.
        verify(propertyRepository).save(stored);
    }

    @Test
    void reusesStoredPropertyByPlaceIdWithoutAddressLookup() throws Exception {
        GoogleCandidate candidate =
                candidate("ChIJSTABLE_place_id", "Bandra Kurla Complex, Mumbai, India", "Mumbai");
        when(addressValidationStrategy.validate(any())).thenReturn(List.of(candidate));
        Property stored = Property.builder()
                .propertyId(1053L)
                .address("Bandra Kurla Complex, Mumbai, Maharashtra, India")
                .city("Mumbai")
                .googlePlaceId("ChIJSTABLE_place_id")
                .externalListingId("listing-9")
                .build();
        when(propertyRepository.findByGooglePlaceId("ChIJSTABLE_place_id")).thenReturn(Optional.of(stored));
        when(comparableListings.forProperty(1053L)).thenReturn(List.of());

        SearchOutcome outcome = service.search(
                request("Bandra Kurla Complex", "Mumbai"), "Bandra Kurla Complex, Mumbai", 7L);

        assertThat(outcome.property()).isSameAs(stored);
        // Place-id hit short-circuits: the address dedup lookup never runs.
        verify(propertyRepository, never())
                .findFirstByAddressIgnoreCaseAndCityIgnoreCaseOrderByPropertyIdAsc(anyString(), anyString());
        verify(propertyRepository, never()).save(any(Property.class));
    }

    @Test
    void persistsNewPropertyWhenNothingMatches() throws Exception {
        GoogleCandidate candidate =
                candidate("ChIJBRANDNEW", "Some New Tower, Pune, Maharashtra, India", "Pune");
        when(addressValidationStrategy.validate(any())).thenReturn(List.of(candidate));
        when(propertyRepository.findByGooglePlaceId("ChIJBRANDNEW")).thenReturn(Optional.empty());
        when(propertyRepository.findFirstByAddressIgnoreCaseAndCityIgnoreCaseOrderByPropertyIdAsc(
                anyString(), anyString())).thenReturn(Optional.empty());
        when(propertyRepository.save(any(Property.class))).thenAnswer(inv -> {
            Property row = inv.getArgument(0);
            row.setPropertyId(2001L);
            return row;
        });
        when(apifyClient.isEnabled()).thenReturn(false); // no token — listings unavailable

        SearchOutcome outcome = service.search(
                request("Some New Tower", "Pune"), "Some New Tower, Pune", 7L);

        assertThat(outcome.property().getPropertyId()).isEqualTo(2001L);
        assertThat(outcome.response().isSuccess()).isTrue();
        verify(propertyRepository).save(any(Property.class));
    }
}
