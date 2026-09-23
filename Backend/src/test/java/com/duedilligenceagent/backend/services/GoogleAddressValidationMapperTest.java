package com.duedilligenceagent.backend.services;

import com.duedilligenceagent.backend.dto.Google.GoogleAddressValidationResponse;
import com.duedilligenceagent.backend.dto.Google.GoogleCandidate;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies the mapping from the Google Address Validation external response
 * into the internal {@link GoogleCandidate}.
 */
class GoogleAddressValidationMapperTest {

    private final GoogleAddressValidationMapper mapper = new GoogleAddressValidationMapper();

    private GoogleAddressValidationResponse fullResponse() {
        return GoogleAddressValidationResponse.builder()
                .responseId("resp-123")
                .result(GoogleAddressValidationResponse.Result.builder()
                        .verdict(GoogleAddressValidationResponse.Verdict.builder()
                                .inputGranularity("PREMISE")
                                .validationGranularity("PREMISE")
                                .geocodeGranularity("PREMISE")
                                .addressComplete(true)
                                .hasUnconfirmedComponents(false)
                                .hasInferredComponents(true)
                                .hasReplacedComponents(false)
                                .possibleNextAction("NONE")
                                .build())
                        .address(GoogleAddressValidationResponse.ValidatedAddress.builder()
                                .formattedAddress("Prestige Shantiniketan, Whitefield, Bengaluru, Karnataka 560048, India")
                                .postalAddress(GoogleAddressValidationResponse.PostalAddress.builder()
                                        .regionCode("IN")
                                        .administrativeArea("Karnataka")
                                        .locality("Bengaluru")
                                        .postalCode("560048")
                                        .addressLines(List.of("Prestige Shantiniketan, Whitefield"))
                                        .build())
                                .addressComponents(List.of(
                                        component("sublocality", "Whitefield"),
                                        component("locality", "Bengaluru"),
                                        component("administrative_area_level_1", "Karnataka"),
                                        component("postal_code", "560048")))
                                .build())
                        .geocode(GoogleAddressValidationResponse.Geocode.builder()
                                .location(GoogleAddressValidationResponse.Location.builder()
                                        .latitude(12.9907)
                                        .longitude(77.7170)
                                        .build())
                                .plusCode(GoogleAddressValidationResponse.PlusCode.builder()
                                        .globalCode("7J4VXM4C+2R")
                                        .build())
                                .placeId("ChIJexample")
                                .placeTypes(List.of("premise", "street_address"))
                                .build())
                        .build())
                .build();
    }

    private GoogleAddressValidationResponse.AddressComponent component(String type, String text) {
        return GoogleAddressValidationResponse.AddressComponent.builder()
                .componentType(type)
                .componentName(GoogleAddressValidationResponse.ComponentName.builder().text(text).build())
                .componentTypeConfirmed(true)
                .build();
    }

    @Test
    void mapsVerdictAddressAndGeocode() {
        GoogleCandidate candidate = mapper.toCandidate(fullResponse());

        assertThat(candidate).isNotNull();
        assertThat(candidate.getFormattedAddress()).contains("Prestige Shantiniketan");
        assertThat(candidate.getCity()).isEqualTo("Bengaluru");
        assertThat(candidate.getState()).isEqualTo("Karnataka");
        assertThat(candidate.getPostalCode()).isEqualTo("560048");
        assertThat(candidate.getLocality()).isEqualTo("Whitefield");
        assertThat(candidate.getLatitude()).isEqualTo(12.9907);
        assertThat(candidate.getLongitude()).isEqualTo(77.7170);
        assertThat(candidate.getPlaceId()).isEqualTo("ChIJexample");
        assertThat(candidate.getPlaceTypes()).containsExactly("premise", "street_address");
        assertThat(candidate.getPlusCode()).isEqualTo("7J4VXM4C+2R");
        assertThat(candidate.getResponseId()).isEqualTo("resp-123");
        assertThat(candidate.getValidationGranularity()).isEqualTo("PREMISE");
        assertThat(candidate.getGeocodeGranularity()).isEqualTo("PREMISE");
        assertThat(candidate.getAddressComplete()).isTrue();
        assertThat(candidate.getHasUnconfirmedComponents()).isFalse();
        assertThat(candidate.getPossibleNextAction()).isEqualTo("NONE");
        // premise place types classify as Residential
        assertThat(candidate.getPropertyType()).isEqualTo("Residential");
    }

    @Test
    void fallsBackToAddressComponentsWhenPostalAddressLacksFields() {
        GoogleAddressValidationResponse response = fullResponse();
        response.getResult().getAddress().setPostalAddress(null);

        GoogleCandidate candidate = mapper.toCandidate(response);

        assertThat(candidate.getCity()).isEqualTo("Bengaluru");
        assertThat(candidate.getState()).isEqualTo("Karnataka");
        assertThat(candidate.getPostalCode()).isEqualTo("560048");
    }

    @Test
    void returnsNullWhenAddressIsUnvalidatable() {
        GoogleAddressValidationResponse response = GoogleAddressValidationResponse.builder()
                .responseId("resp-456")
                .result(GoogleAddressValidationResponse.Result.builder()
                        .verdict(GoogleAddressValidationResponse.Verdict.builder()
                                .validationGranularity("GRANULARITY_UNSPECIFIED")
                                .build())
                        .build())
                .build();

        assertThat(mapper.toCandidate(response)).isNull();
    }

    @Test
    void returnsNullWhenGeocodeFallsBackToCountry() {
        // The Address Validation API almost never returns zero results — for
        // unresolvable input it falls back to a country-level geocode.
        GoogleAddressValidationResponse response = GoogleAddressValidationResponse.builder()
                .responseId("resp-789")
                .result(GoogleAddressValidationResponse.Result.builder()
                        .verdict(GoogleAddressValidationResponse.Verdict.builder()
                                .validationGranularity("OTHER")
                                .geocodeGranularity("OTHER")
                                .hasUnconfirmedComponents(true)
                                .possibleNextAction("FIX")
                                .build())
                        .address(GoogleAddressValidationResponse.ValidatedAddress.builder()
                                .formattedAddress("nonexistent 12345, Xyzcity, Nowhere, India")
                                .build())
                        .geocode(GoogleAddressValidationResponse.Geocode.builder()
                                .location(GoogleAddressValidationResponse.Location.builder()
                                        .latitude(20.59)
                                        .longitude(78.96)
                                        .build())
                                .placeTypes(List.of("country", "political"))
                                .build())
                        .build())
                .build();

        assertThat(mapper.toCandidate(response)).isNull();
    }

    @Test
    void returnsNullForNullResponseOrResult() {
        assertThat(mapper.toCandidate(null)).isNull();
        assertThat(mapper.toCandidate(GoogleAddressValidationResponse.builder().build())).isNull();
    }

    @Test
    void keepsCandidateWhenGranularityUnspecifiedButGeocodeExists() {
        // A coarse result (e.g. a landmark) still geocodes — keep it, the
        // granularity is persisted so the UI can flag it.
        GoogleAddressValidationResponse response = GoogleAddressValidationResponse.builder()
                .result(GoogleAddressValidationResponse.Result.builder()
                        .verdict(GoogleAddressValidationResponse.Verdict.builder()
                                .validationGranularity("GRANULARITY_UNSPECIFIED")
                                .geocodeGranularity("ROUTE")
                                .build())
                        .address(GoogleAddressValidationResponse.ValidatedAddress.builder()
                                .formattedAddress("MG Road, Bengaluru, Karnataka, India")
                                .build())
                        .geocode(GoogleAddressValidationResponse.Geocode.builder()
                                .location(GoogleAddressValidationResponse.Location.builder()
                                        .latitude(12.97)
                                        .longitude(77.60)
                                        .build())
                                .placeTypes(List.of("route"))
                                .build())
                        .build())
                .build();

        GoogleCandidate candidate = mapper.toCandidate(response);
        assertThat(candidate).isNotNull();
        assertThat(candidate.getValidationGranularity()).isEqualTo("GRANULARITY_UNSPECIFIED");
        assertThat(candidate.getGeocodeGranularity()).isEqualTo("ROUTE");
        // route types are not a property — type stays undetermined
        assertThat(candidate.getPropertyType()).isNull();
    }

    @Test
    void prefersSublocalityOverNeighborhoodForLocality() {
        GoogleAddressValidationResponse response = fullResponse();
        response.getResult().getAddress().setAddressComponents(List.of(
                component("neighborhood", "Some Neighborhood"),
                component("sublocality_level_2", "Level2 Area"),
                component("locality", "Bengaluru")));

        GoogleCandidate candidate = mapper.toCandidate(response);

        assertThat(candidate.getLocality()).isEqualTo("Level2 Area");
    }
}
