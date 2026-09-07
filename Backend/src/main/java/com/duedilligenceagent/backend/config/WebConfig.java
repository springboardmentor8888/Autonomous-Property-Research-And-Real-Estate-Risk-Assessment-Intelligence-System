package com.duedilligenceagent.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration. The backend is currently being developed
 * against a separate frontend SPA — these are the dev-server origins
 * we expect to see during local development. Tighten the list when
 * the production frontend domain is known.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // React (CRA) and Vite default dev ports, plus a wildcard
                // origin entry for tools like Postman / curl during local
                // testing. Replace with the production domain when shipped.
                .allowedOrigins(
                        "http://localhost:3000", // CRA
                        "http://localhost:5173", // Vite
                        "http://localhost:4200"  // Angular
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
