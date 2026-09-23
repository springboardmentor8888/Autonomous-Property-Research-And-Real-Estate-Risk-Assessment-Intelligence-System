package com.duedilligenceagent.backend.services;

import com.duedilligenceagent.backend.dto.Google.GoogleAddressValidationResponse;
import com.duedilligenceagent.backend.dto.Google.GoogleCandidate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Maps the Google Address Validation external response into the internal
 * normalized {@link GoogleCandidate}.
 * <p>
 * Extracts the validated address (formatted address, city / state / pincode /
 * locality), the geocode (location, place id, place types, plus code) and the
 * full validation verdict (granularity, completeness, confirmation flags,
 * response id).
 */
@Component
public class GoogleAddressValidationMapper {

    /** Google returns this when the address cannot be validated at all. */
    static final String GRANULARITY_UNSPECIFIED = "GRANULARITY_UNSPECIFIED";

    /** A country-level geocode means Google found nothing for the input. */
    static final String COUNTRY_PLACE_TYPE = "country";

    /**
     * @return the normalized candidate, or {@code null} when the response does
     *         not contain a usable validated address — either nothing could be
     *         validated (unspecified granularity, no geocode, no address) or
     *         Google fell back to a country-level geocode, meaning it found
     *         nothing for the input (the Address Validation API, unlike plain
     *         geocoding, almost never returns zero results).
     */
    public GoogleCandidate toCandidate(GoogleAddressValidationResponse response) {
        if (response == null || response.getResult() == null) {
            return null;
        }
        GoogleAddressValidationResponse.Result result = response.getResult();
        GoogleAddressValidationResponse.Verdict verdict =
                result.getVerdict() != null ? result.getVerdict()
                        : new GoogleAddressValidationResponse.Verdict();

        GoogleAddressValidationResponse.Geocode geocode = result.getGeocode();
        GoogleAddressValidationResponse.ValidatedAddress address = result.getAddress();

        // Country-level geocode = Google found nothing finer for the input
        if (geocode != null && geocode.getPlaceTypes() != null
                && geocode.getPlaceTypes().contains(COUNTRY_PLACE_TYPE)) {
            return null;
        }

        boolean noGeocode = geocode == null;
        boolean noAddress = address == null
                || isBlank(address.getFormattedAddress());
        if (noGeocode && noAddress) {
            return null;
        }

        Double latitude = null;
        Double longitude = null;
        String placeId = null;
        List<String> placeTypes = null;
        String plusCode = null;
        if (geocode != null) {
            if (geocode.getLocation() != null) {
                latitude = geocode.getLocation().getLatitude();
                longitude = geocode.getLocation().getLongitude();
            }
            placeId = geocode.getPlaceId();
            placeTypes = geocode.getPlaceTypes();
            if (geocode.getPlusCode() != null) {
                plusCode = isBlank(geocode.getPlusCode().getGlobalCode())
                        ? geocode.getPlusCode().getCompoundCode()
                        : geocode.getPlusCode().getGlobalCode();
            }
        }

        String city = null;
        String state = null;
        String postalCode = null;
        if (address != null) {
            if (address.getPostalAddress() != null) {
                city = address.getPostalAddress().getLocality();
                state = address.getPostalAddress().getAdministrativeArea();
                postalCode = address.getPostalAddress().getPostalCode();
            }
            // Fall back to address components for anything postalAddress lacks
            if (address.getAddressComponents() != null) {
                for (GoogleAddressValidationResponse.AddressComponent comp : address.getAddressComponents()) {
                    String text = comp.getComponentName() != null ? comp.getComponentName().getText() : null;
                    if (text == null || comp.getComponentType() == null) {
                        continue;
                    }
                    String type = comp.getComponentType();
                    if (city == null && "locality".equals(type)) {
                        city = text;
                    }
                    if (state == null && "administrative_area_level_1".equals(type)) {
                        state = text;
                    }
                    if (postalCode == null && "postal_code".equals(type)) {
                        postalCode = text;
                    }
                }
            }
        }

        String locality = extractLocality(address);

        return GoogleCandidate.builder()
                .placeId(placeId)
                .formattedAddress(address != null ? address.getFormattedAddress() : null)
                .latitude(latitude)
                .longitude(longitude)
                .city(city)
                .state(state)
                .postalCode(postalCode)
                .locality(locality)
                .propertyType(classify(placeTypes))
                .validationGranularity(verdict.getValidationGranularity())
                .geocodeGranularity(verdict.getGeocodeGranularity())
                .addressComplete(verdict.getAddressComplete())
                .hasUnconfirmedComponents(verdict.getHasUnconfirmedComponents())
                .possibleNextAction(verdict.getPossibleNextAction())
                .placeTypes(placeTypes)
                .plusCode(plusCode)
                .responseId(response.getResponseId())
                .build();
    }

    /**
     * Neighborhood-level component: sublocality (levels 1-2) or neighborhood.
     * Used as the locality hint for the property-listing search.
     */
    private String extractLocality(GoogleAddressValidationResponse.ValidatedAddress address) {
        if (address == null || address.getAddressComponents() == null) {
            return null;
        }
        String sublocality2 = null;
        String neighborhood = null;
        for (GoogleAddressValidationResponse.AddressComponent comp : address.getAddressComponents()) {
            String text = comp.getComponentName() != null ? comp.getComponentName().getText() : null;
            if (text == null || comp.getComponentType() == null) {
                continue;
            }
            switch (comp.getComponentType()) {
                case "sublocality", "sublocality_level_1" -> {
                    return text;
                }
                case "sublocality_level_2" -> sublocality2 = text;
                case "neighborhood" -> neighborhood = text;
                default -> { }
            }
        }
        return sublocality2 != null ? sublocality2 : neighborhood;
    }

    /**
     * Classifies the geocoded place into a supported property type using the
     * shared classifier (same rules as the Geocoding strategy).
     */
    private String classify(List<String> placeTypes) {
        return PropertyTypeClassifier.fromGeocodingTypes(placeTypes);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
