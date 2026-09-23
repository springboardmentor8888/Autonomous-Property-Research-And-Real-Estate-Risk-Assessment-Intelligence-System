package com.duedilligenceagent.backend.config;

import com.duedilligenceagent.backend.services.AddressValidationStrategy;
import com.duedilligenceagent.backend.services.GoogleAddressValidationStrategy;
import com.duedilligenceagent.backend.services.GoogleGeocodingStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestClient;

/**
 * Configuration for the Google address validation strategies.
 * <p>
 * The primary strategy is the Google Address Validation API
 * ({@code POST /v1:validateAddress}) which returns the validation verdict
 * (granularity, address completeness) in addition to the geocode. The
 * Geocoding API v4 strategy is kept registered as a fallback — flip the
 * {@code @Primary} annotation to switch.
 * <p>
 * API keys come from {@code .env} via the {@code app.*} properties.
 */
@Configuration
@Slf4j
public class AddressValidationStrategyConfig {

    @Value("${google.api.base-url}")
    private String geocodingBaseUrl;

    @Value("${app.google.geocoding.api-key}")
    private String geocodingApiKey;

    @Bean
    public GoogleGeocodingStrategy googleGeocodingStrategy(RestClient.Builder restClientBuilder) {
        return new GoogleGeocodingStrategy(restClientBuilder, geocodingBaseUrl, geocodingApiKey);
    }

    @Bean
    @Primary
    public AddressValidationStrategy addressValidationStrategy(
            GoogleAddressValidationStrategy addressValidationStrategy,
            GoogleGeocodingStrategy geocodingStrategy) {
        log.info("Active address validation strategy: Google Address Validation API (fallback available: Google Geocoding v4)");
        return addressValidationStrategy;
    }
}
