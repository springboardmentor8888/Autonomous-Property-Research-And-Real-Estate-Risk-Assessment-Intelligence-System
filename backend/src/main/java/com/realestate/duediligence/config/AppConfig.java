package com.realestate.duediligence.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * General application configuration.
 *
 * Registers shared beans that can be injected anywhere in the application.
 */
@Configuration
public class AppConfig {

    /**
     * Registers RestTemplate as a Spring-managed bean.
     *
     * RestTemplate is the standard Spring HTTP client used to call
     * external REST APIs (e.g. Geoapify).
     *
     * By declaring it as a @Bean here, Spring creates a single shared
     * instance and automatically injects it wherever it is needed
     * (e.g. in PropertyService).
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
