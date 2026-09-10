package com.duedilligenceagent.backend.config;

import com.duedilligenceagent.backend.services.AddressValidationStrategy;
import com.duedilligenceagent.backend.services.GoogleGeocodingStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestClient;

/**
 * Configuration for Google Geocoding API as the sole address validation strategy.
 * <p>
 * Only Google Geocoding API is used for both address validation and property search.
 * Set GOOGLE_GEOCODING_API_KEY environment variable before running.
 */
@Configuration
@Slf4j
public class AddressValidationStrategyConfig {

    @Value("${google.api.base-url}")
    private String geocodingBaseUrl;

    @Value("${google.geocoding.api-key}")
    private String apiKey;

    @Bean
    public GoogleGeocodingStrategy googleGeocodingStrategy(RestClient.Builder restClientBuilder) {
        return new GoogleGeocodingStrategy(restClientBuilder, geocodingBaseUrl, apiKey);
    }

    @Bean
    @Primary
    public AddressValidationStrategy addressValidationStrategy(GoogleGeocodingStrategy geocodingStrategy) {
        log.info("Active address validation strategy: Google Geocoding API");
        return geocodingStrategy;
    }
}
